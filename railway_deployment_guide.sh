#!/bin/bash

# 🚀 Railway Deployment Script for Payment Management System
# This script helps set up your Railway deployment

echo "🚀 Payment Management System - Railway Deployment Setup"
echo "======================================================="

echo ""
echo "✅ Your MongoDB Atlas is already configured:"
echo "   Database: payment_management"
echo "   Connection tested successfully ✅"
echo ""

echo "📋 Railway Deployment Steps:"
echo ""
echo "1. 🌐 Go to Railway Dashboard:"
echo "   https://railway.com/project/261b6b03-d65c-4f3a-84fa-6dd5949a4ade"
echo ""

echo "2. ➕ Add New Service:"
echo "   - Click '+ New'"
echo "   - Select 'GitHub Repo'"
echo "   - Choose 'bunchuai123/Payment-Management'"
echo ""

echo "3. ⚙️ Configure Environment Variables:"
echo "   Add these variables in Railway dashboard:"
echo ""
echo "   DATABASE_URL=mongodb+srv://admin:admin@cluster0.p5vhxzy.mongodb.net/payment_management?retryWrites=true&w=majority&appName=Cluster0"
echo "   SECRET_KEY=your_super_secret_jwt_key_here_make_it_64_characters_minimum_for_security"
echo "   SENDGRID_API_KEY=SG.your_sendgrid_api_key_here"
echo "   SENDGRID_FROM_EMAIL=noreply@yourcompany.com"
echo "   CORS_ORIGINS=https://your-frontend-domain.vercel.app"
echo "   ENVIRONMENT=production"
echo "   PORT=8001"
echo ""

echo "4. 📁 Set Root Directory:"
echo "   - Go to Settings → General"
echo "   - Set Root Directory to: backend"
echo ""

echo "5. 🚀 Deploy:"
echo "   Railway will automatically deploy your backend"
echo ""

echo "🎯 Expected Result:"
echo "   Your backend API will be available at:"
echo "   https://your-service-name.railway.app"
echo ""

echo "📧 Next: Setup SendGrid for Email Notifications"
echo "   1. Go to https://sendgrid.com/"
echo "   2. Create free account (100 emails/day)"
echo "   3. Create API key"
echo "   4. Update SENDGRID_API_KEY in Railway variables"
echo ""

echo "🌐 After Backend: Deploy Frontend to Vercel"
echo "   We'll help you with Vercel deployment next!"
echo ""

echo "✅ MongoDB Atlas: Ready ✅"
echo "⏳ Railway Backend: In Progress..."
echo "⏳ SendGrid Email: Next Step..."
echo "⏳ Vercel Frontend: After Backend..."
echo ""

echo "🎉 Your system is ready for production! 🎉"