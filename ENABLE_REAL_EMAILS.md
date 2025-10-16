# 📧 Enable Real Email Notifications

## Current Status
- ✅ Email notification system implemented
- ✅ Mock notifications working (console output)
- ⏳ Real email sending (requires configuration)

## To Enable Real Email Sending:

### 1. **Sign up for SendGrid**
- Go to https://sendgrid.com
- Create free account (100 emails/day)
- Get API key from Settings → API Keys

### 2. **Add Environment Variables**
Add to `.env` file:
```
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourcompany.com
```

### 3. **Install SendGrid Package**
```bash
pip install sendgrid
```

### 4. **Replace Mock Functions**
Replace the mock email functions in `test_server.py` with:

```python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

async def send_email_notification(request: dict, status: str, approver: dict, comments: str = None):
    """Real email notification service using SendGrid"""
    try:
        sg = SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
        
        # Email content (same as mock)
        employee_email = request["employee_email"]
        # ... rest of email content code ...
        
        # Send real email
        message = Mail(
            from_email=os.environ.get('FROM_EMAIL'),
            to_emails=employee_email,
            subject=subject,
            plain_text_content=message
        )
        
        response = sg.send(message)
        print(f"✅ Email sent successfully to {employee_email}")
        
    except Exception as e:
        print(f"❌ Email failed to send: {e}")
        # Fall back to console output
        print(f"📧 EMAIL (FALLBACK): {subject} to {employee_email}")
```

## Current Demo: Mock Notifications
The system currently shows email content in server logs/console, which is perfect for testing and demonstration purposes.

## How to View Current Notifications:
1. **Production**: Check Railway application logs
2. **Local Development**: Watch terminal console when approvals happen
3. **Test Flow**: Submit request → Login as manager → Approve → See console output

The mock system shows exactly what emails would be sent, including:
- ✅ Approval notifications
- ❌ Rejection notifications  
- 🔔 New request notifications to managers
- 📄 Detailed request information
- 💬 Approval comments