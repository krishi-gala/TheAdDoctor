import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.package import Package
from app.models.transaction import Transaction
from app.models.user import User
from app.services.audit_service import create_audit_log
from app.services.wallet_service import apply_purchase_to_wallet, calculate_expiry


def base_transaction_query(db: Session, brand_id: int):
    return db.query(Transaction).filter(Transaction.brand_id == brand_id)


def serialize_transaction(txn: Transaction, package: Optional[Package] = None) -> dict:
    return {
        "transaction_id": txn.transaction_id,
        "package_id": txn.package_id,
        "package_name": package.package_name if package else None,
        "amount": float(txn.amount) if txn.amount is not None else 0,
        "credits_added": txn.credits_added,
        "purchase_date": txn.purchased_at.isoformat() if txn.purchased_at else None,
        "expiry_date": txn.expiry_date.isoformat() if txn.expiry_date else None,
        "payment_status": txn.payment_status,
        "transaction_reference": txn.transaction_reference,
    }


def purchase_package(
    db: Session,
    *,
    brand: User,
    package: Package,
    actor_id: int,
) -> dict:
    expiry_date = calculate_expiry(package.validity_days)
    reference = f"TXN-{uuid.uuid4().hex[:12].upper()}"

    transaction = Transaction(
        brand_id=brand.user_id,
        package_id=package.package_id,
        amount=package.price,
        credits_added=package.credits,
        payment_status="success",
        transaction_reference=reference,
        purchased_at=datetime.utcnow(),
        expiry_date=expiry_date,
    )
    db.add(transaction)
    db.flush()

    apply_purchase_to_wallet(
        db,
        brand_id=brand.user_id,
        package=package,
        expiry_date=expiry_date,
    )

    brand.package = package.package_name
    brand.updated_at = datetime.utcnow()

    create_audit_log(
        db,
        action_by=actor_id,
        action_type="package_purchase",
        target_user_id=brand.user_id,
        description=f"Brand purchased {package.package_name}",
    )

    db.commit()
    db.refresh(transaction)

    return {
        "message": "Package purchased successfully",
        "transaction": serialize_transaction(transaction, package),
        "wallet": {
            "active_package": package.package_name,
            "remaining_credits": package.credits,
            "expiry_date": expiry_date.isoformat(),
        },
    }


def list_transactions(
    db: Session,
    brand_id: int,
    *,
    page: int,
    page_size: int,
) -> dict:
    query = base_transaction_query(db, brand_id).order_by(
        desc(Transaction.purchased_at)
    )
    total = query.count()
    rows = query.offset((page - 1) * page_size).limit(page_size).all()

    package_ids = {row.package_id for row in rows}
    packages = {
        p.package_id: p
        for p in db.query(Package).filter(Package.package_id.in_(package_ids)).all()
    } if package_ids else {}

    total_pages = max(1, (total + page_size - 1) // page_size) if total else 1

    return {
        "transactions": [
            serialize_transaction(row, packages.get(row.package_id))
            for row in rows
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }
