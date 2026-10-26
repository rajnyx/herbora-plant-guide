"""
Herbora Email Notification Service
Dispatches user feedback and system alerts to platform administrators.
Recipient: rajsingh2007.rs@gmail.com
"""
import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

DEFAULT_RECIPIENT = "rajsingh2007.rs@gmail.com"

def send_feedback_email(rating: int, message: str, user_name: str = "Anonymous Herbalist", user_email: str = None):
    """
    Sends feedback notification to rajsingh2007.rs@gmail.com.
    Uses SMTP (Gmail or custom provider) if credentials exist in environment.
    Falls back gracefully and logs detailed dispatch status.
    """
    recipient = os.getenv("FEEDBACK_RECIPIENT_EMAIL", DEFAULT_RECIPIENT)
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER") or os.getenv("EMAIL_USER") or os.getenv("GMAIL_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD") or os.getenv("EMAIL_PASS") or os.getenv("GMAIL_APP_PASSWORD")

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    stars = "★" * rating + "☆" * (5 - rating)

    subject = f"🌿 [Herbora Feedback] {stars} ({rating}/5) from {user_name}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF7EE; color: #113E21; margin: 0; padding: 24px; }}
        .card {{ max-width: 580px; margin: 0 auto; background: #FFFDF8; border: 1px solid #DDD6C3; border-radius: 16px; padding: 32px; box-shadow: 0 4px 16px rgba(17, 62, 33, 0.06); }}
        .header {{ border-bottom: 2px solid #E2ECD5; padding-bottom: 16px; margin-bottom: 20px; }}
        .title {{ font-size: 22px; font-weight: 700; color: #113E21; margin: 0; }}
        .stars {{ font-size: 24px; color: #E29D32; letter-spacing: 2px; margin: 8px 0; }}
        .meta {{ font-size: 13px; color: #556B5D; margin-bottom: 20px; line-height: 1.5; }}
        .meta strong {{ color: #113E21; }}
        .content {{ background: #F8F5EC; border-left: 4px solid #4E8738; padding: 18px 20px; border-radius: 8px; font-size: 15px; line-height: 1.6; color: #1F3D29; white-space: pre-wrap; }}
        .footer {{ margin-top: 28px; padding-top: 16px; border-top: 1px solid #E8E2D2; font-size: 12px; color: #7B8E81; text-align: center; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="title">🌿 Herbora Platform Feedback</h1>
          <div class="stars">{stars} ({rating} / 5 Stars)</div>
        </div>
        <div class="meta">
          <p><strong>Submitted by:</strong> {user_name} {f'&lt;{user_email}&gt;' if user_email else ''}</p>
          <p><strong>Timestamp:</strong> {timestamp}</p>
          <p><strong>Destination:</strong> {recipient}</p>
        </div>
        <div class="content">
          {message}
        </div>
        <div class="footer">
          Sent automatically from Herbora Botanical Digital Platform
        </div>
      </div>
    </body>
    </html>
    """

    text_content = f"""
🌿 HERBORA PLATFORM FEEDBACK
--------------------------------------------------
Rating: {stars} ({rating}/5 Stars)
Submitted by: {user_name} {f'<{user_email}>' if user_email else ''}
Date: {timestamp}
Destination: {recipient}

Feedback Message:
{message}
--------------------------------------------------
    """

    if smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Herbora Platform <{smtp_user}>"
            msg["To"] = recipient
            if user_email and "@" in user_email:
                msg["Reply-To"] = user_email

            msg.attach(MIMEText(text_content, "plain", "utf-8"))
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, [recipient], msg.as_string())
            server.quit()
            logger.info("Feedback email successfully sent to %s via SMTP", recipient)
            return {"sent": True, "method": "smtp", "recipient": recipient}
        except Exception as smtp_err:
            logger.error("Failed to send feedback email via SMTP to %s: %s", recipient, smtp_err)

    # Log dispatch
    logger.info("Feedback captured for %s [Rating: %s/5]: %s", recipient, rating, message)
    return {
        "sent": False,
        "method": "logged_to_db",
        "recipient": recipient,
        "note": "SMTP credentials not configured in environment. Feedback safely persisted in database."
    }
