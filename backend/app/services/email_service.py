import logging
import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


def send_password_reset_email(recipient: str, reset_link: str) -> None:
    message = EmailMessage()
    message["Subject"] = "Reset your The Ad Doctor password"
    message["From"] = os.getenv("SMTP_FROM", os.getenv("SMTP_USERNAME", ""))
    message["To"] = recipient
    message.set_content(
        "Hello,\n\n"
        "We received a request to reset your The Ad Doctor password.\n\n"
        f"Reset your password here:\n{reset_link}\n\n"
        "This link is valid for 15 minutes.\n\n"
        "If you did not request this, you can safely ignore this email.\n\n"
        "The Ad Doctor"
    )

    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    if not host or not message["From"]:
        raise RuntimeError("SMTP is not configured")

    with smtplib.SMTP(host, port, timeout=20) as smtp:
        if os.getenv("SMTP_USE_TLS", "true").lower() == "true":
            smtp.starttls()
        if username and password:
            smtp.login(username, password)
        smtp.send_message(message)