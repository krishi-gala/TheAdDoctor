from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_, text
from datetime import datetime, timezone, date
from dateutil.relativedelta import relativedelta

from app.models.user import User
from app.models.campaign_booking import CampaignBooking
from app.models.weekly_inventory import WeeklyInventory
from app.models.brand_wallet import BrandWallet
from app.models.transaction import Transaction
from app.models.package import Package
from app.models.ad_format import AdFormat


# ─────────────────────────────────────────
# INTERNAL HELPERS
# ─────────────────────────────────────────

def _fmt_month(year: int, month: int) -> str:
    return datetime(year, month, 1).strftime("%b %Y")


def _last_12_months() -> list[tuple[int, int]]:
    """Return list of (year, month) for last 12 months inclusive of current."""
    now = datetime.now(timezone.utc)
    months = []
    for i in range(11, -1, -1):
        d = now - relativedelta(months=i)
        months.append((d.year, d.month))
    return months


# ─────────────────────────────────────────
# 1. SUMMARY KPIs
# ─────────────────────────────────────────

def _summary_kpis(db: Session) -> dict:
    # Total revenue from completed transactions
    total_revenue = db.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(Transaction.payment_status.in_(["completed", "success"])).scalar() or 0

    # Total packages purchased (completed transactions)
    total_packages_purchased = db.query(Transaction).filter(
        Transaction.payment_status.in_(["completed", "success"])
    ).count()

    # Total credits sold (sum of credits_added on completed transactions)
    total_credits_sold = db.query(
        func.coalesce(func.sum(Transaction.credits_added), 0)
    ).filter(Transaction.payment_status.in_(["completed", "success"])).scalar() or 0

    # Total credits consumed (sum of used_credits across all wallets)
    total_credits_consumed = db.query(
        func.coalesce(func.sum(BrandWallet.used_credits), 0)
    ).scalar() or 0

    # Total campaigns booked (all statuses)
    total_campaigns = db.query(CampaignBooking).count()

    # Average revenue per brand (among brands that have made purchases)
    brand_count = db.query(
        func.count(func.distinct(Transaction.brand_id))
    ).filter(Transaction.payment_status.in_(["completed", "success"])).scalar() or 0

    avg_revenue_per_brand = (
        float(total_revenue) / brand_count if brand_count > 0 else 0.0
    )

    return {
        "total_revenue": float(total_revenue),
        "total_packages_purchased": total_packages_purchased,
        "total_credits_sold": int(total_credits_sold),
        "total_credits_consumed": int(total_credits_consumed),
        "total_campaigns": total_campaigns,
        "avg_revenue_per_brand": round(avg_revenue_per_brand, 2),
    }


# ─────────────────────────────────────────
# 2. REVENUE TREND (last 12 months)
# ─────────────────────────────────────────

def _revenue_trend(db: Session) -> list[dict]:
    months = _last_12_months()

    # Revenue per month
    revenue_rows = db.query(
        func.extract("year", Transaction.purchased_at).label("yr"),
        func.extract("month", Transaction.purchased_at).label("mo"),
        func.sum(Transaction.amount).label("revenue"),
        func.count(Transaction.transaction_id).label("packages"),
        func.sum(Transaction.credits_added).label("credits_sold"),
    ).filter(
        Transaction.payment_status.in_(["completed", "success"])
    ).group_by(
        func.extract("year", Transaction.purchased_at),
        func.extract("month", Transaction.purchased_at),
    ).all()

    revenue_map = {
        (int(r.yr), int(r.mo)): {
            "revenue": float(r.revenue or 0),
            "packages": int(r.packages or 0),
            "credits_sold": int(r.credits_sold or 0),
        }
        for r in revenue_rows
    }

    result = []
    for year, month in months:
        data = revenue_map.get((year, month), {"revenue": 0, "packages": 0, "credits_sold": 0})
        result.append({
            "month": _fmt_month(year, month),
            "revenue": data["revenue"],
            "packages_purchased": data["packages"],
            "credits_sold": data["credits_sold"],
        })
    return result


# ─────────────────────────────────────────
# 3. PACKAGE PERFORMANCE
# ─────────────────────────────────────────

def _package_performance(db: Session) -> list[dict]:
    rows = db.query(
        Package.package_name,
        func.count(Transaction.transaction_id).label("purchases"),
        func.coalesce(func.sum(Transaction.amount), 0).label("revenue"),
        func.coalesce(func.avg(Transaction.credits_added), 0).label("avg_credits"),
    ).outerjoin(
        Transaction,
        and_(Transaction.package_id == Package.package_id,
             Transaction.payment_status.in_(["completed", "success"]))
    ).group_by(Package.package_id, Package.package_name
    ).order_by(func.sum(Transaction.amount).desc()
    ).all()

    return [
        {
            "package_name": r.package_name,
            "purchases": int(r.purchases),
            "revenue": float(r.revenue),
            "avg_credits": round(float(r.avg_credits), 1),
        }
        for r in rows
    ]


# ─────────────────────────────────────────
# 4. REVENUE DISTRIBUTION (donut chart)
# ─────────────────────────────────────────

def _revenue_distribution(db: Session) -> list[dict]:
    rows = db.query(
        Package.package_name,
        func.coalesce(func.sum(Transaction.amount), 0).label("revenue"),
    ).outerjoin(
        Transaction,
        and_(Transaction.package_id == Package.package_id,
             Transaction.payment_status.in_(["completed", "success"]))
    ).group_by(Package.package_id, Package.package_name
    ).having(func.sum(Transaction.amount) > 0
    ).order_by(func.sum(Transaction.amount).desc()
    ).all()

    total = sum(float(r.revenue) for r in rows)
    return [
        {
            "name": r.package_name,
            "value": float(r.revenue),
            "percent": round(float(r.revenue) / total * 100, 1) if total > 0 else 0,
        }
        for r in rows
    ]


# ─────────────────────────────────────────
# 5. CAMPAIGN PERFORMANCE (last 12 months)
# ─────────────────────────────────────────

def _campaign_performance(db: Session) -> list[dict]:
    months = _last_12_months()

    rows = db.query(
        func.extract("year", CampaignBooking.created_at).label("yr"),
        func.extract("month", CampaignBooking.created_at).label("mo"),
        CampaignBooking.booking_status,
        func.count(CampaignBooking.booking_id).label("cnt"),
    ).group_by(
        func.extract("year", CampaignBooking.created_at),
        func.extract("month", CampaignBooking.created_at),
        CampaignBooking.booking_status,
    ).all()

    # Build map: (year, month) -> {status: count}
    perf_map: dict[tuple, dict] = {}
    for r in rows:
        key = (int(r.yr), int(r.mo))
        if key not in perf_map:
            perf_map[key] = {}
        perf_map[key][r.booking_status] = int(r.cnt)

    result = []
    statuses = ["pending", "approved", "completed", "rejected"]
    for year, month in months:
        entry = {"month": _fmt_month(year, month)}
        data = perf_map.get((year, month), {})
        for s in statuses:
            entry[s] = data.get(s, 0)
        result.append(entry)
    return result


# ─────────────────────────────────────────
# 6. CREDITS ANALYTICS (last 12 months)
# ─────────────────────────────────────────

def _credits_analytics(db: Session) -> list[dict]:
    months = _last_12_months()

    # Credits purchased per month
    purchased_rows = db.query(
        func.extract("year", Transaction.purchased_at).label("yr"),
        func.extract("month", Transaction.purchased_at).label("mo"),
        func.sum(Transaction.credits_added).label("credits"),
    ).filter(
        Transaction.payment_status.in_(["completed", "success"])
    ).group_by(
        func.extract("year", Transaction.purchased_at),
        func.extract("month", Transaction.purchased_at),
    ).all()

    purchased_map = {
        (int(r.yr), int(r.mo)): int(r.credits or 0)
        for r in purchased_rows
    }

    # Credits consumed per month (via campaign bookings)
    consumed_rows = db.query(
        func.extract("year", CampaignBooking.created_at).label("yr"),
        func.extract("month", CampaignBooking.created_at).label("mo"),
        func.sum(CampaignBooking.credits_used).label("credits"),
    ).filter(
        CampaignBooking.booking_status.in_(["approved", "completed"])
    ).group_by(
        func.extract("year", CampaignBooking.created_at),
        func.extract("month", CampaignBooking.created_at),
    ).all()

    consumed_map = {
        (int(r.yr), int(r.mo)): int(r.credits or 0)
        for r in consumed_rows
    }

    result = []
    for year, month in months:
        key = (year, month)
        result.append({
            "month": _fmt_month(year, month),
            "credits_purchased": purchased_map.get(key, 0),
            "credits_consumed": consumed_map.get(key, 0),
        })
    return result


# ─────────────────────────────────────────
# 7. BRAND LEADERBOARD
# ─────────────────────────────────────────

def _brand_leaderboard(db: Session) -> list[dict]:
    brands = db.query(User).filter(
        User.role == "brand",
        User.is_deleted == False
    ).all()

    result = []
    for brand in brands:
        # Packages purchased
        pkgs = db.query(Transaction).filter(
            Transaction.brand_id == brand.user_id,
            Transaction.payment_status.in_(["completed", "success"])
        ).count()

        # Revenue
        revenue = db.query(
            func.coalesce(func.sum(Transaction.amount), 0)
        ).filter(
            Transaction.brand_id == brand.user_id,
            Transaction.payment_status.in_(["completed", "success"])
        ).scalar() or 0

        # Campaigns
        campaigns = db.query(CampaignBooking).filter(
            CampaignBooking.brand_id == brand.user_id
        ).count()

        credits_purchased = db.query(
            func.coalesce(func.sum(Transaction.credits_added), 0)
        ).filter(
            Transaction.brand_id == brand.user_id,
            Transaction.payment_status.in_(["completed", "success"])
        ).scalar() or 0

        credits_consumed = db.query(
            func.coalesce(func.sum(CampaignBooking.credits_used), 0)
        ).filter(
            CampaignBooking.brand_id == brand.user_id,
            CampaignBooking.booking_status.in_(["approved", "completed"])
        ).scalar() or 0

        # Last activity: latest campaign or transaction
        last_campaign = db.query(
            func.max(CampaignBooking.created_at)
        ).filter(CampaignBooking.brand_id == brand.user_id).scalar()

        last_txn = db.query(
            func.max(Transaction.purchased_at)
        ).filter(Transaction.brand_id == brand.user_id).scalar()

        last_activity = None
        candidates = [t for t in [last_campaign, last_txn] if t is not None]
        if candidates:
            last_activity = max(candidates).isoformat()

        result.append({
            "brand_id": brand.user_id,
            "brand_name": brand.company_name,
            "packages_purchased": pkgs,
            "campaigns_booked": campaigns,
            "credits_purchased": credits_purchased,
            "credits_consumed": credits_consumed,
            "revenue_generated": float(revenue),
            "last_activity": last_activity,
        })

    # Sort by revenue descending
    result.sort(key=lambda x: x["revenue_generated"], reverse=True)
    return result


# ─────────────────────────────────────────
# 8. BRAND CAMPAIGN OVERVIEW
# ─────────────────────────────────────────

def _brand_campaign_overview(db: Session) -> list[dict]:
    today = datetime.now(timezone.utc).date()

    bookings = db.query(CampaignBooking).order_by(
        CampaignBooking.created_at.desc()
    ).all()

    # Build weekly slot map: format_slug -> remaining_slots for current week
    current_inventory = db.query(
        AdFormat.slug,
        WeeklyInventory.remaining_slots,
        WeeklyInventory.weekly_limit,
    ).join(
        WeeklyInventory, WeeklyInventory.format_id == AdFormat.format_id
    ).filter(
        WeeklyInventory.week_start <= today,
        WeeklyInventory.week_end >= today,
    ).all()

    slot_map = {
        row.slug: {
            "remaining": row.remaining_slots,
            "limit": row.weekly_limit,
        }
        for row in current_inventory
    }

    # Brand name map
    brand_map = {
        u.user_id: u.company_name
        for u in db.query(User).filter(User.role == "brand").all()
    }

    # Progress by status
    progress_map = {
        "pending": 25,
        "approved": 75,
        "completed": 100,
        "rejected": 0,
    }

    result = []
    for b in bookings:
        slot_info = slot_map.get(b.format_slug, {})
        result.append({
            "booking_id": b.booking_id,
            "campaign_name": f"Campaign #{b.booking_id}",
            "brand_name": brand_map.get(b.brand_id, f"Brand {b.brand_id}"),
            "ad_format": b.format_slug,
            "business_type": b.business_type,
            "booking_date": b.booking_date,
            "booking_time": b.booking_time,
            "status": b.booking_status,
            "credits_used": b.credits_used,
            "weekly_slot_remaining": slot_info.get("remaining"),
            "weekly_slot_limit": slot_info.get("limit"),
            "progress": progress_map.get(b.booking_status, 0),
            "created_at": b.created_at.isoformat() if b.created_at else None,
        })
    return result


# ─────────────────────────────────────────
# 9. AD FORMAT ANALYTICS
# ─────────────────────────────────────────

def _ad_format_analytics(db: Session) -> dict:
    formats = db.query(AdFormat).filter(AdFormat.is_active == True).all()

    format_stats = []
    for fmt in formats:
        bookings_count = db.query(CampaignBooking).filter(
            CampaignBooking.format_slug == fmt.slug
        ).count()

        revenue = db.query(
            func.coalesce(func.sum(Transaction.amount), 0)
        ).join(
            BrandWallet, BrandWallet.brand_id == Transaction.brand_id
        ).join(
            CampaignBooking,
            and_(
                CampaignBooking.brand_id == Transaction.brand_id,
                CampaignBooking.format_slug == fmt.slug,
            )
        ).filter(
            Transaction.payment_status.in_(["completed", "success"])
        ).scalar() or 0

        # Inventory utilization for this format
        inv = db.query(
            func.sum(WeeklyInventory.weekly_limit).label("total"),
            func.sum(WeeklyInventory.booked_slots).label("booked"),
        ).filter(WeeklyInventory.format_id == fmt.format_id).first()

        total_slots = int(inv.total or 0)
        booked_slots = int(inv.booked or 0)
        utilization = round(booked_slots / total_slots * 100, 1) if total_slots > 0 else 0.0

        format_stats.append({
            "slug": fmt.slug,
            "name": fmt.name,
            "bookings": bookings_count,
            "revenue": float(revenue),
            "utilization_percent": utilization,
            "total_slots": total_slots,
            "booked_slots": booked_slots,
        })

    if not format_stats:
        return {
            "most_booked": None,
            "least_booked": None,
            "highest_revenue": None,
            "lowest_revenue": None,
            "avg_utilization": 0,
            "formats": [],
        }

    sorted_by_bookings = sorted(format_stats, key=lambda x: x["bookings"])
    sorted_by_revenue = sorted(format_stats, key=lambda x: x["revenue"])
    avg_util = round(
        sum(f["utilization_percent"] for f in format_stats) / len(format_stats), 1
    )

    return {
        "most_booked": sorted_by_bookings[-1]["name"],
        "least_booked": sorted_by_bookings[0]["name"],
        "highest_revenue_format": sorted_by_revenue[-1]["name"],
        "lowest_revenue_format": sorted_by_revenue[0]["name"],
        "avg_utilization": avg_util,
        "formats": format_stats,
    }


# ─────────────────────────────────────────
# 10. BUSINESS INSIGHTS
# ─────────────────────────────────────────

def _business_insights(db: Session) -> list[dict]:
    insights = []

    # Highest revenue package
    top_pkg_row = db.query(
        Package.package_name,
        func.sum(Transaction.amount).label("rev"),
    ).join(Transaction, Transaction.package_id == Package.package_id
    ).filter(Transaction.payment_status.in_(["completed", "success"])
    ).group_by(Package.package_id, Package.package_name
    ).order_by(func.sum(Transaction.amount).desc()
    ).first()

    if top_pkg_row:
        insights.append({
            "key": "highest_revenue_package",
            "label": "Highest Revenue Package",
            "value": top_pkg_row.package_name,
            "sub": f"₹{float(top_pkg_row.rev):,.0f} total revenue",
            "icon": "package",
        })

    # Highest revenue brand
    top_brand_row = db.query(
        User.company_name,
        func.sum(Transaction.amount).label("rev"),
    ).join(Transaction, Transaction.brand_id == User.user_id
    ).filter(Transaction.payment_status.in_(["completed", "success"])
    ).group_by(User.user_id, User.company_name
    ).order_by(func.sum(Transaction.amount).desc()
    ).first()

    if top_brand_row:
        insights.append({
            "key": "highest_revenue_brand",
            "label": "Highest Revenue Brand",
            "value": top_brand_row.company_name,
            "sub": f"₹{float(top_brand_row.rev):,.0f} generated",
            "icon": "brand",
        })

    # Most active brand (most campaigns)
    most_active_row = db.query(
        User.company_name,
        func.count(CampaignBooking.booking_id).label("cnt"),
    ).join(CampaignBooking, CampaignBooking.brand_id == User.user_id
    ).group_by(User.user_id, User.company_name
    ).order_by(func.count(CampaignBooking.booking_id).desc()
    ).first()

    if most_active_row:
        insights.append({
            "key": "most_active_brand",
            "label": "Most Active Brand",
            "value": most_active_row.company_name,
            "sub": f"{most_active_row.cnt} campaigns booked",
            "icon": "activity",
        })

    # Most booked ad format
    top_format_row = db.query(
        CampaignBooking.format_slug,
        func.count(CampaignBooking.booking_id).label("cnt"),
    ).group_by(CampaignBooking.format_slug
    ).order_by(func.count(CampaignBooking.booking_id).desc()
    ).first()

    if top_format_row:
        insights.append({
            "key": "most_booked_format",
            "label": "Most Booked Ad Format",
            "value": top_format_row.format_slug,
            "sub": f"{top_format_row.cnt} bookings",
            "icon": "format",
        })

    # Average revenue per booking
    avg_rev_row = db.query(
        func.avg(Transaction.amount).label("avg_rev"),
    ).filter(Transaction.payment_status.in_(["completed", "success"])).scalar() or 0

    insights.append({
        "key": "avg_revenue_per_booking",
        "label": "Avg Revenue Per Booking",
        "value": f"₹{float(avg_rev_row):,.0f}",
        "sub": "per completed transaction",
        "icon": "revenue",
    })

    # Average credits per booking
    avg_credits_row = db.query(
        func.avg(CampaignBooking.credits_used).label("avg_c")
    ).scalar() or 0

    insights.append({
        "key": "avg_credits_per_booking",
        "label": "Avg Credits Per Booking",
        "value": f"{round(float(avg_credits_row), 1)}",
        "sub": "credits per campaign",
        "icon": "credits",
    })

    # Top booking day of week
    top_day_row = db.query(
        func.extract("dow", CampaignBooking.created_at).label("dow"),
        func.count(CampaignBooking.booking_id).label("cnt"),
    ).group_by(
        func.extract("dow", CampaignBooking.created_at)
    ).order_by(func.count(CampaignBooking.booking_id).desc()).first()

    if top_day_row:
        days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        day_name = days[int(top_day_row.dow)] if top_day_row.dow is not None else "N/A"
        insights.append({
            "key": "top_booking_day",
            "label": "Top Booking Day",
            "value": day_name,
            "sub": f"{top_day_row.cnt} bookings on this day",
            "icon": "calendar",
        })

    # Peak booking hour
    peak_hour_row = db.query(
        func.extract("hour", CampaignBooking.created_at).label("hr"),
        func.count(CampaignBooking.booking_id).label("cnt"),
    ).group_by(
        func.extract("hour", CampaignBooking.created_at)
    ).order_by(func.count(CampaignBooking.booking_id).desc()).first()

    if peak_hour_row and peak_hour_row.hr is not None:
        hr = int(peak_hour_row.hr)
        ampm = "AM" if hr < 12 else "PM"
        hr12 = hr % 12 or 12
        insights.append({
            "key": "peak_booking_time",
            "label": "Peak Booking Time",
            "value": f"{hr12}:00 {ampm}",
            "sub": f"{peak_hour_row.cnt} bookings at this hour",
            "icon": "clock",
        })

    # Highest inventory usage format
    high_inv = db.query(
        AdFormat.name,
        func.sum(WeeklyInventory.booked_slots).label("booked"),
        func.sum(WeeklyInventory.weekly_limit).label("total"),
    ).join(WeeklyInventory, WeeklyInventory.format_id == AdFormat.format_id
    ).group_by(AdFormat.format_id, AdFormat.name
    ).having(func.sum(WeeklyInventory.weekly_limit) > 0
    ).order_by(
        (func.sum(WeeklyInventory.booked_slots) * 1.0 / func.sum(WeeklyInventory.weekly_limit)).desc()
    ).first()

    if high_inv:
        util = round(float(high_inv.booked) / float(high_inv.total) * 100, 1)
        insights.append({
            "key": "highest_inventory_usage",
            "label": "Highest Inventory Usage",
            "value": high_inv.name,
            "sub": f"{util}% slots utilized",
            "icon": "inventory",
        })

    # Lowest inventory usage format
    low_inv = db.query(
        AdFormat.name,
        func.sum(WeeklyInventory.booked_slots).label("booked"),
        func.sum(WeeklyInventory.weekly_limit).label("total"),
    ).join(WeeklyInventory, WeeklyInventory.format_id == AdFormat.format_id
    ).group_by(AdFormat.format_id, AdFormat.name
    ).having(func.sum(WeeklyInventory.weekly_limit) > 0
    ).order_by(
        (func.sum(WeeklyInventory.booked_slots) * 1.0 / func.sum(WeeklyInventory.weekly_limit)).asc()
    ).first()

    if low_inv:
        util = round(float(low_inv.booked) / float(low_inv.total) * 100, 1)
        insights.append({
            "key": "lowest_inventory_usage",
            "label": "Lowest Inventory Usage",
            "value": low_inv.name,
            "sub": f"{util}% slots utilized",
            "icon": "inventory",
        })

    return insights


# ─────────────────────────────────────────
# PUBLIC ENTRY POINT
# ─────────────────────────────────────────

def get_full_reports(db: Session) -> dict:
    return {
        "summary": _summary_kpis(db),
        "revenue_trend": _revenue_trend(db),
        "package_performance": _package_performance(db),
        "revenue_distribution": _revenue_distribution(db),
        "campaign_performance": _campaign_performance(db),
        "credits_analytics": _credits_analytics(db),
        "brand_leaderboard": _brand_leaderboard(db),
        "brand_campaign_overview": _brand_campaign_overview(db),
        "ad_format_analytics": _ad_format_analytics(db),
        "insights": _business_insights(db),
    }
