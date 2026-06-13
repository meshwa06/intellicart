import json
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from detector import ObjectDetector

app = FastAPI(title="Smart Cart Detection API")

origins = ["http://localhost:3000"]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = ObjectDetector("model.pt", "prices.json")


@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_data = await file.read()
    detections = detector.detect(image_data)
    return {"detections": detections}


@app.get("/prices")
async def get_prices():
    with open("prices.json") as f:
        return json.load(f)


@app.get("/health")
async def health():
    return {"status": "ok"}
