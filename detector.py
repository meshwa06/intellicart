import io
import json
from PIL import Image
from ultralytics import YOLO


class ObjectDetector:
    def __init__(self, model_path: str, prices_path: str):
        self.model = YOLO(model_path)
        with open(prices_path) as f:
            self.prices = json.load(f)

    def detect(self, image_data: bytes) -> list[dict]:
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        orig_w, orig_h = image.size

        results = self.model(image)[0]

        detections = []
        for box in results.boxes:
            class_id = int(box.cls[0])
            class_name = self.model.names[class_id]
            confidence = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                "class": class_name,
                "confidence": round(confidence, 2),
                # Normalized 0-1 so frontend can scale to any canvas size
                "bbox": {
                    "x1": x1 / orig_w,
                    "y1": y1 / orig_h,
                    "x2": x2 / orig_w,
                    "y2": y2 / orig_h,
                },
                "price": self.prices.get(class_name, 0.0),
            })

        return detections
