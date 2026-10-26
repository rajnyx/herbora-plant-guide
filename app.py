"""
Herbora Backend Application Entry Point (Root Wrapper)
Enables seamless Vercel deployment whether root directory is repository root or backend.
"""
import os
import sys

_backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from backend.app import app, application, create_app

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
