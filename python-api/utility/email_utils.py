import os
from aiosmtplib import SMTP
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

async def send_email(to_email: str, subject: str, body: str):
    try:
        message = EmailMessage()
        message["From"] = os.getenv("EMAIL_USERNAME")
        message["To"] = to_email
        message["Subject"] = subject
        message.set_content(body)

        async with SMTP(
            hostname=os.getenv("SMTP_HOST"),
            port=int(os.getenv("SMTP_PORT")),
            start_tls=True
        ) as smtp:
            await smtp.connect()
            await smtp.login(os.getenv("EMAIL_USERNAME"), os.getenv("EMAIL_PASSWORD"))
            await smtp.send_message(message)

        print(f"✅ Email sent to {to_email}")
    except Exception as e:
        print(f"❌ Email failed: {e}")