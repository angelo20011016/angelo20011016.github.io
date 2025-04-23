from flask_mail import Mail, Message
from flask import current_app
import os

mail = Mail()

def init_mail(app):
    mail.init_app(app)
    return mail

def send_reset_email(to_email, reset_link):
    subject = "重設密碼連結"
    sender = current_app.config.get('MAIL_USERNAME')
    msg = Message(subject, recipients=[to_email], sender=sender)
    msg.body = f"您好，請點擊下方連結重設您的密碼：\n{reset_link}\n\n如果您沒有申請重設密碼，請忽略此信。"
    mail.send(msg)
