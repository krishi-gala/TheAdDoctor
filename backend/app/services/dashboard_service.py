from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.campaign_booking import CampaignBooking
from app.models.weekly_inventory import WeeklyInventory
from app.models.brand_wallet import BrandWallet
from app.models.transaction import Transaction
from app.models.audit_log import AuditLog
from app.models.ad_format import AdFormat
from app.models.package import Package
from datetime import datetime, timezone


def _get_user_display_name(user) -> str:
    if not user:
        return "System"

    if getattr(user, "role", None) == "brand":
        return getattr(user, "company_name", None) or getattr(user, "email", None) or "Unknown Brand"

    return getattr(user, "company_name", None) or getattr(user, "email", None) or "System"


def get_dashboard_stats(db: Session) -> dict:
    # --- EXECUTIVE SUMMARY ---
    total_brands = db.query(User).filter(User.role == "brand", User.is_deleted == False).count()
    active_campaigns = db.query(CampaignBooking).filter(CampaignBooking.booking_status == "approved").count()
    pending_approvals = db.query(CampaignBooking).filter(CampaignBooking.booking_status == "pending").count()
    total_packages = db.query(Package).filter(Package.is_active == True).count()
    total_packages_purchased = db.query(Transaction).filter(Transaction.payment_status.in_(["completed", "success"])).count()

    executive_summary = {
        "total_brands": total_brands,
        "active_campaigns": active_campaigns,
        "pending_approvals": pending_approvals,
        "total_packages": total_packages,
        "total_packages_purchased": total_packages_purchased
    }

    # --- ACTION CENTER ---
    # Top 5 pending campaigns
    pending_campaigns = db.query(CampaignBooking).filter(
        CampaignBooking.booking_status == "pending"
    ).order_by(CampaignBooking.created_at.desc()).limit(5).all()

    # Low inventory slots (<= 20% of weekly limit) for current week
    today = datetime.now(timezone.utc).date()
    low_inventory = db.query(WeeklyInventory).filter(
        WeeklyInventory.week_start <= today,
        WeeklyInventory.week_end >= today,
        WeeklyInventory.remaining_slots <= (WeeklyInventory.weekly_limit * 0.20)
    ).limit(5).all()

    # Brands below 20 credits
    low_credit_brands = db.query(BrandWallet).join(User).filter(
        (BrandWallet.total_credits - BrandWallet.used_credits) < 20,
        User.is_deleted == False
    ).limit(5).all()

    # Rejected Campaigns
    rejected_campaigns = db.query(CampaignBooking).filter(
        CampaignBooking.booking_status == "rejected"
    ).order_by(CampaignBooking.created_at.desc()).limit(5).all()

    action_center = {
        "pending_campaigns": [
            {"id": c.booking_id, "brand_id": c.brand_id, "format": c.format_slug, "date": c.booking_date}
            for c in pending_campaigns
        ],
        "low_inventory_slots": [
            {"id": inv.inventory_id, "format_id": inv.format_id, "remaining": inv.remaining_slots, "limit": inv.weekly_limit}
            for inv in low_inventory
        ],
        "low_credit_brands": [
            {"brand_id": w.brand_id, "brand_name": w.brand.company_name if w.brand else "Unknown", "remaining_credits": w.total_credits - w.used_credits}
            for w in low_credit_brands
        ],
        "rejected_campaigns": [
            {"id": c.booking_id, "brand_id": c.brand_id, "format": c.format_slug, "date": c.booking_date}
            for c in rejected_campaigns
        ]
    }

    # --- LIVE OPERATIONS ---
    from sqlalchemy.orm import aliased
    import re

    ActionUser = aliased(User)
    TargetUser = aliased(User)

    latest_events = db.query(AuditLog, ActionUser, TargetUser).outerjoin(
        ActionUser, AuditLog.action_by == ActionUser.user_id
    ).outerjoin(
        TargetUser, AuditLog.target_user_id == TargetUser.user_id
    ).order_by(AuditLog.created_at.desc()).limit(10).all()

    live_operations = []
    for log, action_user, target_user in latest_events:
        desc = log.description or ""
        
        if action_user and action_user.role == "brand":
            brand_name = action_user.company_name
            if desc.startswith("Brand "):
                desc = desc.replace("Brand ", f"{brand_name} ", 1)
            elif brand_name not in desc:
                desc = f"{brand_name}: {desc}"
                
        if target_user and target_user.role == "brand" and getattr(action_user, 'user_id', None) != target_user.user_id:
            target_brand_name = target_user.company_name
            if "updated brand" in desc.lower():
                desc = re.sub(r'(?i)updated brand', f'updated brand {target_brand_name}', desc)
            elif "added" in desc.lower() and "credits" in desc.lower():
                desc = f"{desc} to {target_brand_name}"
            elif target_brand_name not in desc:
                desc = f"{desc} ({target_brand_name})"

        live_operations.append({
            "id": log.audit_id,
            "action": log.action_type,
            "description": desc,
            "time": log.created_at.isoformat() if log.created_at else None,
            "severity": log.severity
        })

    # --- INVENTORY HEALTH ---
    inventory_summary = db.query(
        func.sum(WeeklyInventory.weekly_limit).label("total"),
        func.sum(WeeklyInventory.booked_slots).label("used"),
        func.sum(WeeklyInventory.remaining_slots).label("available")
    ).filter(
        WeeklyInventory.week_start <= today,
        WeeklyInventory.week_end >= today
    ).first()

    total_inv = inventory_summary.total or 0
    used_inv = inventory_summary.used or 0
    available_inv = inventory_summary.available or 0
    inventory_utilization_percent = (used_inv / total_inv * 100) if total_inv > 0 else 0

    format_health = db.query(
        AdFormat.name,
        func.sum(WeeklyInventory.weekly_limit).label("total"),
        func.sum(WeeklyInventory.booked_slots).label("used"),
        func.sum(WeeklyInventory.remaining_slots).label("available")
    ).join(WeeklyInventory).filter(
        WeeklyInventory.week_start <= today,
        WeeklyInventory.week_end >= today
    ).group_by(AdFormat.name).order_by(func.sum(WeeklyInventory.booked_slots).desc()).all()

    formats = []
    for fh in format_health:
        f_total = fh.total or 0
        f_used = fh.used or 0
        f_avail = fh.available or 0
        f_util = (f_used / f_total * 100) if f_total > 0 else 0
        formats.append({
            "name": fh.name,
            "total": int(f_total),
            "used": int(f_used),
            "available": int(f_avail),
            "utilization": round(f_util, 1)
        })

    inventory_health = {
        "total": int(total_inv),
        "used": int(used_inv),
        "available": int(available_inv),
        "utilization_percent": round(inventory_utilization_percent, 1),
        "formats": formats
    }

    # --- CAMPAIGN OVERVIEW ---
    campaign_counts = db.query(
        CampaignBooking.booking_status,
        func.count(CampaignBooking.booking_id)
    ).group_by(CampaignBooking.booking_status).all()

    overview_dict = {status: count for status, count in campaign_counts}
    campaign_overview = {
        "pending": overview_dict.get("pending", 0),
        "approved": overview_dict.get("approved", 0),
        "rejected": overview_dict.get("rejected", 0),
        "completed": overview_dict.get("completed", 0)
    }

    return {
        "executive_summary": executive_summary,
        "action_center": action_center,
        "live_operations": live_operations,
        "inventory_health": inventory_health,
        "campaign_overview": campaign_overview
    }