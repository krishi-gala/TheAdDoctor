import bcrypt


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")


def verify_password(plain_password: str, stored_password: str) -> bool:
    if plain_password == stored_password:
        return True
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            stored_password.encode("utf-8"),
        )
    except Exception:
        return False
