"""
KrishiNiti Flask Server — Production WSGI entry point for Render/Gunicorn.
Gunicorn looks for a callable named `app` in this module.
"""
from flask_server import flask_app as app
