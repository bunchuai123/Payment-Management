import sendgrid
from sendgrid.helpers.mail import Mail, To
import os
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

class EmailService:
    def __init__(self):
        self.sg = sendgrid.SendGridAPIClient(api_key=os.getenv('SENDGRID_API_KEY'))
        self.from_email = os.getenv('FROM_EMAIL')
    
    async def send_email(
        self, 
        to_emails: List[str], 
        subject: str, 
        html_content: str, 
        plain_text_content: Optional[str] = None
    ):
        """Send email using SendGrid"""
        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=to_emails,
                subject=subject,
                html_content=html_content,
                plain_text_content=plain_text_content or html_content
            )
            
            response = self.sg.send(message)
            return {"status": "success", "status_code": response.status_code}
        
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def send_request_notification(
        self, 
        to_email: str, 
        employee_name: str, 
        request_type: str, 
        amount: float, 
        request_id: str
    ):
        """Send notification for new request submission"""
        subject = f"New Payment Request: {request_type} - {employee_name}"
        html_content = f"""
        <html>
        <body>
            <h2>New Payment Request Submitted</h2>
            <p><strong>Employee:</strong> {employee_name}</p>
            <p><strong>Request Type:</strong> {request_type}</p>
            <p><strong>Amount:</strong> ${amount:,.2f}</p>
            <p><strong>Request ID:</strong> {request_id}</p>
            <p>Please review and approve/reject this request in the system.</p>
            <br>
            <p>Best regards,<br>Payment Management System</p>
        </body>
        </html>
        """
        
        return await self.send_email([to_email], subject, html_content)
    
    async def send_approval_notification(
        self, 
        to_email: str, 
        employee_name: str, 
        request_type: str, 
        amount: float, 
        status: str, 
        approver_name: str,
        comments: Optional[str] = None
    ):
        """Send notification for request approval/rejection"""
        action = "approved" if "approved" in status.lower() else "rejected"
        subject = f"Payment Request {action.title()}: {request_type}"
        
        html_content = f"""
        <html>
        <body>
            <h2>Payment Request {action.title()}</h2>
            <p><strong>Employee:</strong> {employee_name}</p>
            <p><strong>Request Type:</strong> {request_type}</p>
            <p><strong>Amount:</strong> ${amount:,.2f}</p>
            <p><strong>Status:</strong> {status.replace('_', ' ').title()}</p>
            <p><strong>{action.title()} by:</strong> {approver_name}</p>
            {f'<p><strong>Comments:</strong> {comments}</p>' if comments else ''}
            <br>
            <p>Best regards,<br>Payment Management System</p>
        </body>
        </html>
        """
        
        return await self.send_email([to_email], subject, html_content)

# Global email service instance
email_service = EmailService()
