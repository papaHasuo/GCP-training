import io
import uuid
from datetime import datetime
from firebase_functions import https_fn
from firebase_admin import firestore, storage

from .utils import json_response, verify_bearer_token


def _init_firestore():
    return firestore.client()


def _init_storage():
    return storage.bucket("gcp-learning-497122.appspot.com")


@https_fn.on_request()
def upload(req: https_fn.Request) -> https_fn.Response:
    """Upload image file: validate, store in Storage, save metadata to Firestore"""
    if req.method == "OPTIONS":
        return json_response({"ok": True}, 204)
    
    decoded, error = verify_bearer_token(req)
    if error:
        return error

    try:
        uid = decoded["uid"]
        
        # Get file from request
        if "file" not in req.files:
            return json_response({"error": "No file provided"}, 400)
        
        file = req.files["file"]
        
        if not file or file.filename == "":
            return json_response({"error": "Invalid file"}, 400)
        
        # Read file into memory
        file_content = file.read()
        file_size = len(file_content)
        file_name = file.filename
        mime_type = file.content_type
        
        # Validate file size (1MB = 1048576 bytes)
        if file_size > 1048576:
            return json_response({"error": "File size exceeds 1MB limit"}, 400)
        
        # Validate MIME type (image only)
        if not mime_type or not mime_type.startswith("image/"):
            return json_response({"error": "Only image files allowed"}, 400)
        
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Determine file extension
        ext = file_name.rsplit(".", 1)[1].lower() if "." in file_name else "bin"
        storage_path = f"users/{uid}/{file_id}.{ext}"
        
        # Upload to Storage
        bucket = _init_storage()
        blob = bucket.blob(storage_path)
        blob.upload_from_string(file_content, content_type=mime_type)
        
        # Save metadata to Firestore
        db = _init_firestore()
        db.collection("users").document(uid).collection("uploads").document(file_id).set({
            "fileId": file_id,
            "fileName": file_name,
            "size": file_size,
            "mimeType": mime_type,
            "uploadedAt": datetime.now(),
            "storagePath": storage_path
        })
        
        return json_response({
            "ok": True,
            "fileId": file_id,
            "storagePath": storage_path
        }, 201)
    
    except Exception as exc:
        return json_response({"error": str(exc)}, 500)


@https_fn.on_request()
def my_uploads(req: https_fn.Request) -> https_fn.Response:
    """Get user's uploaded images"""
    if req.method == "OPTIONS":
        return json_response({"ok": True}, 204)
    
    decoded, error = verify_bearer_token(req)
    if error:
        return error
    
    try:
        uid = decoded["uid"]
        db = _init_firestore()
        
        # Get all uploads for user
        docs = db.collection("users").document(uid).collection("uploads").stream()
        uploads = []
        for doc in docs:
            uploads.append(doc.to_dict())
        
        # Sort by uploadedAt descending
        uploads.sort(key=lambda x: x["uploadedAt"], reverse=True)
        
        return json_response({"uploads": uploads}, 200)
    
    except Exception as exc:
        return json_response({"error": str(exc)}, 500)


@https_fn.on_request()
def delete_upload(req: https_fn.Request) -> https_fn.Response:
    """Delete user's uploaded image"""
    if req.method == "OPTIONS":
        return json_response({"ok": True}, 204)
    
    decoded, error = verify_bearer_token(req)
    if error:
        return error
    
    try:
        uid = decoded["uid"]
        file_id = req.args.get("fileId")
        
        if not file_id:
            return json_response({"error": "fileId parameter required"}, 400)
        
        db = _init_firestore()
        
        # Verify ownership and get storage path
        doc = db.collection("users").document(uid).collection("uploads").document(file_id).get()
        if not doc.exists:
            return json_response({"error": "File not found"}, 404)
        
        storage_path = doc.get("storagePath")
        
        # Delete from Storage
        bucket = _init_storage()
        bucket.blob(storage_path).delete()
        
        # Delete from Firestore
        db.collection("users").document(uid).collection("uploads").document(file_id).delete()
        
        return json_response({"ok": True}, 200)
    
    except Exception as exc:
        return json_response({"error": str(exc)}, 500)
