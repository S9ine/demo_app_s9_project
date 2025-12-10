from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from app.database import init_db, close_db
from app.api import auth, users, master_data, daily_advances, schedules, audit_logs
import logging

logger = logging.getLogger(__name__)


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
        "http://localhost:5174",  # Vite dev server (alternative port)
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
app.include_router(schedules.router, prefix="/api", tags=["Schedules"])
app.include_router(daily_advances.router, prefix="/api", tags=["Daily Advances"])
app.include_router(audit_logs.router, prefix="/api/audit", tags=["Audit Logs"])


# Custom exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Log and return detailed validation errors"""
    logger.error(f"❌ Validation Error on {request.method} {request.url.path}")
    body = await request.body()
    logger.error(f"Body: {body}")
    
    # Format errors to be JSON serializable (remove ctx with ValueError objects)
    formatted_errors = []
    for error in exc.errors():
        error_dict = {
            "type": error.get("type"),
            "loc": error.get("loc"),
            "msg": error.get("msg"),
            "input": str(error.get("input")) if error.get("input") is not None else None
        }
        formatted_errors.append(error_dict)
    
    logger.error(f"Errors: {formatted_errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": formatted_errors
        }
    )


# General exception handler for 500 errors
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Log and return general errors"""
    logger.error(f"❌ Internal Server Error on {request.method} {request.url.path}")
    logger.error(f"Error: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": f"Internal server error: {str(exc)}"
        }
    )


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
