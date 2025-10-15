"""
PDF Generation Module for Payment Management System
Generates professional paychecks and reports using ReportLab
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib.colors import Color, black, white, grey, blue, orange
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.platypus.flowables import HRFlowable
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie
from datetime import datetime, date
import io
from typing import Dict, Any, Optional
import os


class PaymentPDFGenerator:
    """Professional PDF generator for payment documents"""
    
    def __init__(self):
        self.page_width, self.page_height = letter
        self.margin = 0.75 * inch
        self.content_width = self.page_width - (2 * self.margin)
        
        # Company colors - matching the theme
        self.primary_color = Color(0.97, 0.45, 0.02)  # Orange #F7720D
        self.dark_color = Color(0.1, 0.1, 0.1)       # Dark #1A1A1A
        self.light_grey = Color(0.95, 0.95, 0.95)    # Light grey
        self.medium_grey = Color(0.6, 0.6, 0.6)      # Medium grey
        
        # Setup styles
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        # Company header style
        self.styles.add(ParagraphStyle(
            name='CompanyHeader',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=self.primary_color,
            spaceAfter=6,
            alignment=TA_CENTER
        ))
        
        # Document title style
        self.styles.add(ParagraphStyle(
            name='DocumentTitle',
            parent=self.styles['Heading2'],
            fontSize=18,
            textColor=self.dark_color,
            spaceAfter=12,
            alignment=TA_CENTER
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading3'],
            fontSize=14,
            textColor=self.dark_color,
            spaceBefore=12,
            spaceAfter=6,
            leftIndent=0
        ))
        
        # Field label style
        self.styles.add(ParagraphStyle(
            name='FieldLabel',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.medium_grey,
            spaceAfter=2
        ))
        
        # Field value style
        self.styles.add(ParagraphStyle(
            name='FieldValue',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=self.dark_color,
            spaceAfter=8,
            fontName='Helvetica-Bold'
        ))
        
        # Footer style
        self.styles.add(ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=self.medium_grey,
            alignment=TA_CENTER
        ))
    
    def _create_header(self):
        """Create document header with company branding"""
        header_elements = []
        
        # Company name
        header_elements.append(Paragraph("PAYMENT MANAGEMENT SYSTEM", self.styles['CompanyHeader']))
        
        # Company subtitle
        subtitle = Paragraph("Professional Payment Processing", self.styles['Normal'])
        header_elements.append(subtitle)
        
        # Add some space
        header_elements.append(Spacer(1, 0.3 * inch))
        
        return header_elements
    
    def _create_footer(self):
        """Create document footer"""
        footer_elements = []
        
        # Horizontal line
        footer_elements.append(HRFlowable(width="100%", thickness=1, color=self.light_grey))
        footer_elements.append(Spacer(1, 0.1 * inch))
        
        # Footer text
        footer_text = f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
        footer_elements.append(Paragraph(footer_text, self.styles['Footer']))
        
        disclaimer = "This document is generated automatically by the Payment Management System."
        footer_elements.append(Paragraph(disclaimer, self.styles['Footer']))
        
        return footer_elements
    
    def generate_paycheck(self, request_data: Dict[str, Any], user_data: Dict[str, Any]) -> bytes:
        """
        Generate a professional paycheck PDF for an approved payment request
        
        Args:
            request_data: Dictionary containing request information
            user_data: Dictionary containing user/employee information
            
        Returns:
            bytes: PDF content as bytes
        """
        # Create PDF buffer
        buffer = io.BytesIO()
        
        # Create document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=self.margin,
            leftMargin=self.margin,
            topMargin=self.margin,
            bottomMargin=self.margin
        )
        
        # Build document content
        story = []
        
        # Header
        story.extend(self._create_header())
        
        # Document title
        story.append(Paragraph("PAYMENT AUTHORIZATION", self.styles['DocumentTitle']))
        story.append(Spacer(1, 0.2 * inch))
        
        # Document info table
        doc_info_data = [
            ['Document Number:', f"PAY-{request_data.get('id', '000000')}"],
            ['Issue Date:', datetime.now().strftime('%B %d, %Y')],
            ['Status:', 'APPROVED'],
            ['Payment Method:', 'Direct Deposit']
        ]
        
        doc_info_table = Table(doc_info_data, colWidths=[2*inch, 2.5*inch])
        doc_info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0, 0), (0, -1), self.medium_grey),
            ('TEXTCOLOR', (1, 0), (1, -1), self.dark_color),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        story.append(doc_info_table)
        story.append(Spacer(1, 0.3 * inch))
        
        # Employee Information Section
        story.append(Paragraph("Employee Information", self.styles['SectionHeader']))
        
        employee_data = [
            ['Employee Name:', user_data.get('name', user_data.get('email', 'Unknown'))],
            ['Employee ID:', user_data.get('id', 'N/A')],
            ['Email:', user_data.get('email', 'N/A')],
            ['Role:', user_data.get('role', 'Employee')],
            ['Department:', user_data.get('department', 'General')]
        ]
        
        employee_table = Table(employee_data, colWidths=[2*inch, 3.5*inch])
        employee_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0, 0), (0, -1), self.medium_grey),
            ('TEXTCOLOR', (1, 0), (1, -1), self.dark_color),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        story.append(employee_table)
        story.append(Spacer(1, 0.3 * inch))
        
        # Payment Details Section
        story.append(Paragraph("Payment Details", self.styles['SectionHeader']))
        
        # Format amount with proper currency
        amount = float(request_data.get('amount', 0))
        formatted_amount = f"${amount:,.2f}"
        
        payment_data = [
            ['Request Type:', request_data.get('request_type', 'Payment').title()],
            ['Description:', request_data.get('description', 'N/A')],
            ['Request Date:', request_data.get('created_at', datetime.now().strftime('%B %d, %Y'))],
            ['Approval Date:', request_data.get('approved_at', datetime.now().strftime('%B %d, %Y'))],
            ['Approved By:', request_data.get('approved_by', 'System')],
        ]
        
        payment_table = Table(payment_data, colWidths=[2*inch, 3.5*inch])
        payment_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0, 0), (0, -1), self.medium_grey),
            ('TEXTCOLOR', (1, 0), (1, -1), self.dark_color),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        story.append(payment_table)
        story.append(Spacer(1, 0.2 * inch))
        
        # Payment Amount (Highlighted)
        amount_box_data = [
            ['PAYMENT AMOUNT:', formatted_amount]
        ]
        
        amount_table = Table(amount_box_data, colWidths=[3*inch, 2.5*inch])
        amount_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 16),
            ('TEXTCOLOR', (0, 0), (0, 0), self.dark_color),
            ('TEXTCOLOR', (1, 0), (1, 0), self.primary_color),
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, -1), self.light_grey),
            ('BOX', (0, 0), (-1, -1), 2, self.primary_color),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        
        story.append(amount_table)
        story.append(Spacer(1, 0.4 * inch))
        
        # Authorization Section
        story.append(Paragraph("Authorization", self.styles['SectionHeader']))
        
        auth_text = f"""
        This payment authorization has been approved through the Payment Management System 
        and is authorized for processing. The payment amount of {formatted_amount} has been 
        approved for {user_data.get('name', user_data.get('email', 'the employee'))} 
        and will be processed according to company payment procedures.
        """
        
        story.append(Paragraph(auth_text, self.styles['Normal']))
        story.append(Spacer(1, 0.3 * inch))
        
        # Signature section
        signature_data = [
            ['Approved By:', '_' * 30, 'Date:', '_' * 20],
            ['', 'Digital Signature', '', datetime.now().strftime('%m/%d/%Y')]
        ]
        
        signature_table = Table(signature_data, colWidths=[1*inch, 2.5*inch, 0.7*inch, 1.3*inch])
        signature_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, 0), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.dark_color),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        story.append(signature_table)
        story.append(Spacer(1, 0.5 * inch))
        
        # Footer
        story.extend(self._create_footer())
        
        # Build PDF
        doc.build(story)
        
        # Get PDF content
        pdf_content = buffer.getvalue()
        buffer.close()
        
        return pdf_content
    
    def generate_expense_report(self, requests_data: list, date_range: Dict[str, Any]) -> bytes:
        """
        Generate an expense/payment summary report
        
        Args:
            requests_data: List of request dictionaries
            date_range: Dictionary with 'start_date' and 'end_date'
            
        Returns:
            bytes: PDF content as bytes
        """
        # Create PDF buffer
        buffer = io.BytesIO()
        
        # Create document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=self.margin,
            leftMargin=self.margin,
            topMargin=self.margin,
            bottomMargin=self.margin
        )
        
        # Build document content
        story = []
        
        # Header
        story.extend(self._create_header())
        
        # Document title
        story.append(Paragraph("PAYMENT SUMMARY REPORT", self.styles['DocumentTitle']))
        story.append(Spacer(1, 0.2 * inch))
        
        # Report period
        period_text = f"Report Period: {date_range.get('start_date', 'N/A')} to {date_range.get('end_date', 'N/A')}"
        story.append(Paragraph(period_text, self.styles['Normal']))
        story.append(Spacer(1, 0.3 * inch))
        
        # Summary statistics
        total_amount = sum(float(req.get('amount', 0)) for req in requests_data)
        approved_requests = [req for req in requests_data if req.get('status') in ['approved', 'approved_final']]
        pending_requests = [req for req in requests_data if req.get('status') == 'pending']
        rejected_requests = [req for req in requests_data if req.get('status') == 'rejected']
        
        summary_data = [
            ['Total Requests:', str(len(requests_data))],
            ['Approved Requests:', str(len(approved_requests))],
            ['Pending Requests:', str(len(pending_requests))],
            ['Rejected Requests:', str(len(rejected_requests))],
            ['Total Amount (Approved):', f"${sum(float(req.get('amount', 0)) for req in approved_requests):,.2f}"]
        ]
        
        summary_table = Table(summary_data, colWidths=[2.5*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0, 0), (0, -1), self.medium_grey),
            ('TEXTCOLOR', (1, 0), (1, -1), self.dark_color),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        story.append(summary_table)
        story.append(Spacer(1, 0.3 * inch))
        
        # Detailed requests table
        story.append(Paragraph("Request Details", self.styles['SectionHeader']))
        
        if requests_data:
            # Table headers
            table_data = [['ID', 'Employee', 'Type', 'Amount', 'Status', 'Date']]
            
            # Add request data
            for req in requests_data[:20]:  # Limit to first 20 for space
                table_data.append([
                    str(req.get('id', 'N/A'))[:8],
                    req.get('employee_email', 'N/A')[:20],
                    req.get('request_type', 'N/A').title()[:15],
                    f"${float(req.get('amount', 0)):,.0f}",
                    req.get('status', 'N/A').title(),
                    req.get('created_at', 'N/A')[:10]
                ])
            
            requests_table = Table(table_data, colWidths=[0.8*inch, 1.5*inch, 1*inch, 0.8*inch, 0.8*inch, 0.8*inch])
            requests_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BACKGROUND', (0, 0), (-1, 0), self.light_grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), self.dark_color),
                ('TEXTCOLOR', (0, 1), (-1, -1), self.dark_color),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (3, 0), (3, -1), 'RIGHT'),  # Amount column
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('GRID', (0, 0), (-1, -1), 1, self.medium_grey),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            
            story.append(requests_table)
        else:
            story.append(Paragraph("No requests found for the specified period.", self.styles['Normal']))
        
        story.append(Spacer(1, 0.5 * inch))
        
        # Footer
        story.extend(self._create_footer())
        
        # Build PDF
        doc.build(story)
        
        # Get PDF content
        pdf_content = buffer.getvalue()
        buffer.close()
        
        return pdf_content


# Utility functions for easy PDF generation
def generate_paycheck_pdf(request_data: Dict[str, Any], user_data: Dict[str, Any]) -> bytes:
    """
    Utility function to generate a paycheck PDF
    
    Args:
        request_data: Request information dictionary
        user_data: User information dictionary
        
    Returns:
        bytes: PDF content as bytes
    """
    generator = PaymentPDFGenerator()
    return generator.generate_paycheck(request_data, user_data)


def generate_report_pdf(requests_data: list, date_range: Dict[str, Any] = None) -> bytes:
    """
    Utility function to generate a summary report PDF
    
    Args:
        requests_data: List of request dictionaries
        date_range: Optional date range dictionary
        
    Returns:
        bytes: PDF content as bytes
    """
    if date_range is None:
        date_range = {
            'start_date': datetime.now().strftime('%Y-%m-01'),
            'end_date': datetime.now().strftime('%Y-%m-%d')
        }
    
    generator = PaymentPDFGenerator()
    return generator.generate_expense_report(requests_data, date_range)


# Test function
if __name__ == "__main__":
    # Test data
    test_request = {
        'id': 'REQ-001',
        'request_type': 'overtime',
        'amount': '1500.00',
        'description': 'Additional work on project completion',
        'status': 'approved',
        'created_at': '2025-10-15',
        'approved_at': '2025-10-15',
        'approved_by': 'Manager Smith'
    }
    
    test_user = {
        'id': 'EMP-001',
        'name': 'John Doe',
        'email': 'john.doe@example.com',
        'role': 'Employee',
        'department': 'Engineering'
    }
    
    # Generate test PDF
    pdf_content = generate_paycheck_pdf(test_request, test_user)
    
    # Save to file for testing
    with open('test_paycheck.pdf', 'wb') as f:
        f.write(pdf_content)
    
    print("Test PDF generated successfully: test_paycheck.pdf")