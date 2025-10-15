from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, requests, users
from app.database import connect_to_mongo, close_mongo_connection
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Payment Management System",
    description="A comprehensive payment request and approval system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3008"],  # Next.js ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(requests.router, prefix="/api/requests", tags=["requests"])

@app.get("/")
async def root():
    return {"message": "Payment Management System API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
