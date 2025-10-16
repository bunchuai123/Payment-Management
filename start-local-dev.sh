#!/bin/bash

# Payment Management System - Local Development Starter
# Run this script to start both backend and frontend servers

echo "🚀 Starting Payment Management System - Local Development"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the Payment Management project root directory"
    exit 1
fi

echo "📡 Starting Backend Server..."
cd backend
if [ ! -d "venv" ]; then
    echo "❌ Error: Virtual environment not found. Please run setup first."
    exit 1
fi

# Activate virtual environment and start backend
source venv/Scripts/activate 2>/dev/null || source venv/bin/activate
python test_server.py &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

cd ..

echo "🌐 Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "========================================="
echo "   🎉 Payment Management System Ready!"
echo "========================================="
echo ""
echo "🔗 Backend API: http://localhost:8001"
echo "🌐 Frontend App: http://localhost:3001"
echo ""
echo "👤 Login Credentials:"
echo "   📧 Email: admin@paymentpro.com"
echo "   🔒 Password: admin123"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped."
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT

# Wait for user to stop
wait