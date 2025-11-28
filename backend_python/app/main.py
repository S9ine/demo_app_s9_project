from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db, close_db
from app.api import auth, users, master_data, daily_advances


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events
    """
    # Startup - Initialize database tables
    await init_db()
    yield
    # Shutdown - Close database connection
    await close_db()


# Create FastAPI application
app = FastAPI(
    title="Premium Management API",
    description="Backend API for Premium Management System with PostgreSQL",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users & Roles"])
app.include_router(master_data.router, prefix="/api", tags=["Master Data"])
app.include_router(daily_advances.router, prefix="/api", tags=["Financial"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Premium Management API with PostgreSQL",
        "version": "2.0.0",
        "database": "PostgreSQL",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "database": "PostgreSQL"}
