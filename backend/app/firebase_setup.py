import os
import firebase_admin
from firebase_admin import credentials
import logging

logger = logging.getLogger("privaseal")

def init_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if already initialized
        firebase_admin.get_app()
        return
    except ValueError:
        pass # Not initialized yet

    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    default_cred_path = os.path.join(backend_dir, "firebaseServiceAccountKey.json")
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", default_cred_path)
    
    if os.path.exists(cred_path):
        try:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
    else:
        logger.warning(f"Firebase Service Account key not found at {cred_path}. Firebase Admin SDK not initialized.")
