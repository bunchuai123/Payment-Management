@echo off
echo Starting Payment Management System Backend...
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Copy environment file if it doesn't exist
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo.
        echo IMPORTANT: Please update .env file with your actual configuration values
        echo - MongoDB connection string
        echo - Secret key for JWT
        echo - SendGrid API key and email settings
        echo.
    )
)

REM Start the server
echo Starting FastAPI server...
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
