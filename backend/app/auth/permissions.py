from fastapi import Depends, HTTPException, status

from app.core.security import get_current_user


def permission_required(permission_name: str):

    def permission_checker(
        current_user=Depends(get_current_user),
    ):
        permissions = current_user.get("permissions", [])

        if permission_name not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied",
            )

        return current_user

    return permission_checker
