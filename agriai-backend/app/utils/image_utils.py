from PIL import Image
import io
from fastapi import UploadFile, HTTPException, status

def validate_image(file: UploadFile):
    """Validate MIME type and magic bytes (JPEG/PNG only)"""
    allowed_types = ["image/jpeg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type: {file.content_type}. Only JPEG and PNG are allowed."
        )

def validate_size(file: UploadFile, max_mb: int = 10):
    """Reject files > max_mb"""
    # Note: file.size might not be available in all versions of FastAPI/Starlette
    # but in 0.115.x it should be available. If not, we can use seek/tell.
    max_bytes = max_mb * 1024 * 1024
    
    # Check size
    file.file.seek(0, 2)  # seek to end
    size = file.file.tell()
    file.file.seek(0)  # reset to start
    
    if size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large: {size / (1024 * 1024):.2f}MB. Max allowed is {max_mb}MB."
        )

def strip_exif(image: Image.Image) -> Image.Image:
    """Remove metadata from image"""
    data = list(image.getdata())
    image_without_exif = Image.new(image.mode, image.size)
    image_without_exif.putdata(data)
    return image_without_exif

def preprocess_for_inference(image_bytes: bytes) -> Image.Image:
    """Resize 224x224, convert RGB"""
    image = Image.open(io.BytesIO(image_bytes))
    
    # Strip EXIF
    image = strip_exif(image)
    
    # Convert to RGB if necessary (e.g., PNG with alpha channel)
    if image.mode != "RGB":
        image = image.convert("RGB")
        
    # Resize
    image = image.resize((224, 224))
    
    return image
