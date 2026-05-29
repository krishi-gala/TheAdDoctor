from sqlalchemy import text
from sqlalchemy.orm import Session


def get_role_id_by_name(
    role_name: str,
    db: Session
):
    query = text("""
        SELECT role_id
        FROM roles
        WHERE role_name = :role_name
    """)

    row = db.execute(
        query,
        {"role_name": role_name}
    ).fetchone()

    return row.role_id if row else None


def get_permissions_by_role(
    role_id: int,
    db: Session
):
    query = text("""
        SELECT p.permission_name
        FROM role_permissions rp
        JOIN permissions p
            ON rp.permission_id = p.permission_id
        WHERE rp.role_id = :role_id
    """)

    result = db.execute(
        query,
        {"role_id": role_id},
    ).fetchall()

    return [
        row.permission_name
        for row in result
    ]


def resolve_user_permissions(
    role_name: str,
    db: Session,
    role_id=None
):
    resolved_role_id = role_id

    if resolved_role_id is None:
        resolved_role_id = get_role_id_by_name(
            role_name,
            db
        )

    if resolved_role_id is None:
        return []

    return get_permissions_by_role(
        resolved_role_id,
        db
    )