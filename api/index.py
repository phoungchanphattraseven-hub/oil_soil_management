import sys
from pathlib import Path

# Add backend directory to sys.path so modules in backend can be imported
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from main import app

# Export FastAPI app for Vercel Serverless Function runtime
app = app
