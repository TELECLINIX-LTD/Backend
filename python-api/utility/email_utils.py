import random
import string
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from jinja2 import Environment, FileSystemLoader
from dotenv import load_dotenv
import os

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL")


def generate_otp(length=6):
    """Generate a random OTP of specified length."""
    return ''.join(random.choices(string.digits, k=length))

async def send_otp_email(email: str, otp: str):
    env = Environment(loader=FileSystemLoader("templates"))
    template = env.get_template("otp_email.html")
    html_content = template.render(otp=otp)

    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=email,
        subject="Your OTP for Signup Verification",
        html_content=html_content
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        logger.info(f"Email sent to {email}. Status code: {response.status_code}")
        return True
    except Exception as e:
        logger.error(f"Error sending email to {email}: {str(e)}")
        return False

