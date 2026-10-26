"""
WSGI / Vercel Serverless Function entry point for Herbora Flask API (Root Wrapper)
"""
import os
import sys

_backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from backend.app import app, application

if __name__ == "__main__":
    app.run()
