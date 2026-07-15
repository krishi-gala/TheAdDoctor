from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Any

from app.models.user import User
from app.models.package import Package
from app.models.campaign_booking import CampaignBooking
from app.models.ad_format import AdFormat

def global_search(db: Session, query: str) -> List[Dict[str, Any]]:
    if not query or len(query.strip()) < 2:
        return []
        
    search_term = f"%{query.strip()}%"
    results = []

    # 1. Search Brands (Users with role='brand')
    brands = db.query(User).filter(
        User.role == "brand",
        User.is_deleted == False,
        or_(
            User.company_name.ilike(search_term),
            User.email.ilike(search_term)
        )
    ).limit(5).all()
    
    for brand in brands:
        results.append({
            "type": "brand",
            "title": brand.company_name or "Unknown Brand",
            "subtitle": brand.email,
            "url": f"/admin/brands/{brand.user_id}",
            "icon": "Building"
        })

    # 2. Search Packages
    packages = db.query(Package).filter(
        Package.package_name.ilike(search_term)
    ).limit(5).all()
    
    for pkg in packages:
        results.append({
            "type": "package",
            "title": pkg.package_name,
            "subtitle": f"{pkg.credits} Credits - ${pkg.price}",
            "url": f"/admin/packages",
            "icon": "Package"
        })

    # 3. Search Ad Formats
    formats = db.query(AdFormat).filter(
        AdFormat.name.ilike(search_term)
    ).limit(5).all()
    
    for fmt in formats:
        results.append({
            "type": "ad_format",
            "title": fmt.name,
            "subtitle": f"{fmt.standard_credits} Std / {fmt.prime_credits} Prime",
            "url": f"/admin/formats",
            "icon": "Layout"
        })

    # 4. Search Campaigns
    campaigns = db.query(CampaignBooking).join(User).filter(
        or_(
            User.company_name.ilike(search_term),
            CampaignBooking.format_slug.ilike(search_term)
        )
    ).limit(5).all()
    
    for camp in campaigns:
        brand_name = camp.brand.company_name if camp.brand else "Unknown"
        results.append({
            "type": "campaign",
            "title": f"Campaign #{camp.booking_id}",
            "subtitle": f"{brand_name} - {camp.format_slug}",
            "url": f"/admin/bookings",
            "icon": "Target"
        })

    return results
