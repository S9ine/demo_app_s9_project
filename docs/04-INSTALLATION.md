# 🚀 Installation & Usage Guide
## Premium Security ERP System

**Last Updated:** December 12, 2025

---

## 📋 Requirements

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| OS | Windows 10 / macOS / Linux | Windows 11 / macOS 13+ |
| RAM | 4 GB | 8 GB+ |
| Storage | 2 GB | 5 GB+ |
| Node.js | 18.x | 20.x LTS |
| Python | 3.10 | 3.11+ |
| PostgreSQL | 14 | 15+ |

### Software Requirements

```
✅ Python 3.10+
✅ Node.js 18+
✅ PostgreSQL 15+
✅ Git
```

---

## 📥 Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/S9ine/demo_app_s9_project.git
cd demo_app_s9_project
```

### Step 2: Setup Database (PostgreSQL)

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create Database
CREATE DATABASE erp_db;

-- Verify
\l
```

### Step 3: Setup Backend (Python)

```bash
# Navigate to backend
cd backend_python

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py

# Create default data (if needed)
python create_default_data.py
```

### Step 4: Setup Frontend (React)

```bash
# Navigate to frontend (new terminal)
cd frontend

# Install dependencies
npm install
```

---

## 🎮 Running the Application

### Quick Start (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend_python
.\venv\Scripts\Activate.ps1    # Windows PowerShell
# or
venv\Scripts\activate          # Windows CMD
# or
source venv/bin/activate       # Mac/Linux

uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access URLs

| Service | URL |
|---------|-----|
| 🖥️ Frontend | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:8000 |
| 📚 API Docs (Swagger) | http://localhost:8000/docs |
| 📖 API Docs (ReDoc) | http://localhost:8000/redoc |

---

## 🔐 Default Login

```
Username: admin
Password: admin123
```

---

## 📁 Project Structure

```
demo_app_s9_project/
├── 📁 backend_python/
│   ├── 📁 app/
│   │   ├── 📁 api/           # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── master_data.py
│   │   │   ├── users.py
│   │   │   └── daily_advances.py
│   │   ├── 📁 core/          # Security, dependencies
│   │   │   ├── deps.py
│   │   │   └── security.py
│   │   ├── 📁 models/        # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── customer.py
│   │   │   ├── site.py
│   │   │   ├── guard.py
│   │   │   ├── staff.py
│   │   │   └── ...
│   │   ├── 📁 schemas/       # Pydantic schemas
│   │   │   ├── auth.py
│   │   │   ├── master_data.py
│   │   │   └── user.py
│   │   ├── config.py         # Configuration
│   │   ├── database.py       # Database connection
│   │   └── main.py           # FastAPI app
│   ├── 📁 templates/         # Excel templates
│   ├── 📁 migrations/        # Database migrations
│   ├── requirements.txt
│   └── init_db.py
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 common/    # Shared components
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── PaginationControls.jsx
│   │   │   ├── 📁 core/      # Layout components
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── MainContent.jsx
│   │   │   ├── 📁 modals/    # Modal dialogs
│   │   │   │   ├── CustomerFormModal.jsx
│   │   │   │   ├── SiteFormModal.jsx
│   │   │   │   └── ...
│   │   │   └── 📁 pages/     # Page components
│   │   │       ├── Dashboard.jsx
│   │   │       ├── CustomerList.jsx
│   │   │       └── ...
│   │   ├── 📁 config/
│   │   │   └── api.js        # Axios configuration
│   │   ├── 📁 context/
│   │   │   └── AuthContext.jsx
│   │   ├── 📁 hooks/
│   │   │   └── useBanks.js
│   │   ├── 📁 pages/
│   │   │   └── LoginScreen.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── 📁 docs/                  # Documentation
│   ├── 01-DATABASE.md
│   ├── 02-WORKFLOW.md
│   ├── 03-FEATURES.md
│   └── 04-INSTALLATION.md
│
└── README.md
```

---

## ⚙️ Configuration

### Backend Configuration

**File:** `backend_python/app/config.py`

```python
# Database
DATABASE_URL = "postgresql+asyncpg://postgres:password@localhost:5432/erp_db"

# JWT Settings
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# CORS Origins
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]
```

### Frontend Configuration

**File:** `frontend/src/config/api.js`

```javascript
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

## 🔧 Common Commands

### Backend Commands

```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run server
uvicorn app.main:app --reload --port 8000

# Run with host (for network access)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Initialize database
python init_db.py

# Reset database (caution!)
python reset_db.py

# Create templates
python create_template.py

# Run migrations
python migrations/V9_create_shifts_table.py
```

### Frontend Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Database Commands

```bash
# Connect to PostgreSQL
psql -U postgres -d erp_db

# Backup database
pg_dump -U postgres -d erp_db -F c -f backup.dump

# Restore database
pg_restore -U postgres -d erp_db backup.dump

# Check tables
psql -U postgres -d erp_db -c "\dt"
```

---

## 🚨 Troubleshooting

### Problem: Backend won't start

**Symptom:** `ModuleNotFoundError` or `uvicorn: command not found`

**Solution:**
```bash
# Make sure venv is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

### Problem: Database connection failed

**Symptom:** `Connection refused` or `database "erp_db" does not exist`

**Solution:**
```bash
# Check PostgreSQL is running
pg_isready

# Create database if missing
psql -U postgres -c "CREATE DATABASE erp_db;"

# Initialize tables
python init_db.py
```

### Problem: CORS Error

**Symptom:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Make sure backend is running on port 8000
2. Check `ALLOWED_ORIGINS` in `config.py`
3. Restart backend server

### Problem: Login failed

**Symptom:** `401 Unauthorized` or `Invalid credentials`

**Solution:**
```bash
# Reset admin user
python init_db.py

# Or create new user via API docs
# http://localhost:8000/docs
```

### Problem: Excel import failed

**Symptom:** `Column mismatch` or `Invalid format`

**Solution:**
1. Download fresh template from system
2. Don't modify column headers
3. Check required fields are filled
4. Save as .xlsx format

---

## 🔄 Updates & Deployment

### Update from Git

```bash
# Pull latest changes
git pull origin main

# Update backend dependencies
cd backend_python
pip install -r requirements.txt

# Update frontend dependencies
cd ../frontend
npm install

# Run migrations if any
python migrations/Vxx_migration_name.py
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Output in dist/ folder
# Serve with nginx or similar
```

### Production Checklist

- [ ] Change `SECRET_KEY` in config
- [ ] Use strong database password
- [ ] Enable HTTPS
- [ ] Set proper CORS origins
- [ ] Configure firewall
- [ ] Setup backup schedule
- [ ] Monitor logs

---

## 📞 Support

### Logs Location

- **Backend:** Terminal output (uvicorn)
- **Frontend:** Browser Console (F12)
- **Database:** PostgreSQL logs

### Debug Mode

**Backend:**
```bash
# With debug logging
uvicorn app.main:app --reload --log-level debug
```

**Frontend:**
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

---

## 📋 Quick Reference

| Action | Command |
|--------|---------|
| Start Backend | `uvicorn app.main:app --reload --port 8000` |
| Start Frontend | `npm run dev` |
| Access App | http://localhost:5173 |
| API Docs | http://localhost:8000/docs |
| Login | admin / admin123 |
| Init Database | `python init_db.py` |
| Create Backup | `pg_dump -U postgres -d erp_db -f backup.sql` |


python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
