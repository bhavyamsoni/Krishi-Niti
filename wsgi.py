import os
import sys

root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask_server import flask_app as app

if __name__ == "__main__":
    from waitress import serve
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server on port {port}...")
    serve(app, host="0.0.0.0", port=port, threads=8)
