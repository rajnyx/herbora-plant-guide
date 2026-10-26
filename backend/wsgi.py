"""
WSGI / Vercel Serverless Function entry point for Herbora Flask API
"""
from app import app, application

if __name__ == "__main__":
    app.run()
