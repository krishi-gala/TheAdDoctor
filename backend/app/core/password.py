import bcrypt

PASSWORD_MIN_LENGTH = 8


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


def set_password(user, new_password: str) -> None:
    user.password_hash = hash_password(new_password)
