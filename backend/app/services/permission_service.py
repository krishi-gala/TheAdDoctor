from sqlalchemy import text

from app.core.database import engine


def get_role_id_by_name(role_name: str):
    query = text("""
        SELECT role_id
        FROM roles
        WHERE role_name = :role_name
    """)

    with engine.connect() as conn:
        row = conn.execute(query, {"role_name": role_name}).fetchone()

    return row.role_id if row else None


def get_permissions_by_role(role_id: int):
    query = text("""
        SELECT p.permission_name
        FROM role_permissions rp
        JOIN permissions p
            ON rp.permission_id = p.permission_id
        WHERE rp.role_id = :role_id
    """)

    with engine.connect() as conn:
        result = conn.execute(
            query,
            {"role_id": role_id},
        ).fetchall()

    return [row.permission_name for row in result]


def resolve_user_permissions(role_name: str, role_id=None):
    resolved_role_id = role_id

    if resolved_role_id is None:
        resolved_role_id = get_role_id_by_name(role_name)

    if resolved_role_id is None:
        return []

    return get_permissions_by_role(resolved_role_id)
