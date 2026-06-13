# IntelliCart – Real-Time Grocery Detection \& Automated Billing

> A camera-only checkout system powered by YOLOv8 — no barcode scanners, no specialised hardware.

**Live Demo:** [grocery-article-detection-with-yolo.vercel.app](https://grocery-article-detection-with-yolo.vercel.app)

\---



### Model Weights

The trained model weights (model.pt) are too large for GitHub.

Download here: \[model.pt] [https://drive.google.com/file/d/1hOWh604X9jGLcqSpIP-g38brbdWXD2XF/view?usp=drive\_link](https://drive.google.com/file/d/1hOWh604X9jGLcqSpIP-g38brbdWXD2XF/view?usp=drive_link)



## The Problem

Traditional retail checkout is slow, error-prone, and expensive to automate. Amazon Go solved this — but their infrastructure relies on ceiling-mounted sensors, weight-based shelving, and proprietary hardware that costs millions per store, putting it out of reach for small and mid-sized retailers.

**IntelliCart closes that gap.** A standard webcam, a trained YOLOv8 model, and a FastAPI backend is all it takes to detect grocery items in real time and generate an itemised bill automatically — no barcode, no scanner, no hardware investment.

\---

## Results

|Model|mAP@0.5|Notes|
|-|-|-|
|**YOLOv8s (IntelliCart)**|**0.9567**|Best accuracy, production-deployed|
|Faster R-CNN|0.8932|Higher latency, better on small objects|
|SSD-MobileNet|0.2832|\~46 FPS, significant accuracy trade-off|

YOLOv8s was selected for deployment due to its superior mAP while maintaining real-world inference speed suitable for live webcam use (\~8 FPS in browser over API).

\---

## How It Works

```
Webcam Feed → FastAPI Backend → YOLOv8 Inference → Bounding Boxes + Prices → Frontend Bill
```

1. The frontend captures frames from the user's webcam via the browser
2. Frames are sent to a FastAPI backend running YOLOv8 inference
3. Detections are filtered: an item must appear in **5+ consecutive frames** with **≥65% confidence** before being added to the bill — reducing false positives
4. The frontend renders live bounding boxes and builds the cart in real time
5. On stop, a printable receipt is generated automatically

**Supported item categories (17 classes):** Alcohol, Candy, Canned Food, Chocolate, Dessert, Dried Food, Dried Fruit, Drink, Gum, Instant Drink, Instant Noodles, Milk, Personal Hygiene, Puffed Food, Seasoner, Stationery, Tissue

\---

## Tech Stack

|Layer|Technology|
|-|-|
|ML Model|YOLOv8s (Ultralytics), trained on custom COCO-format dataset|
|Backend|Python, FastAPI, Uvicorn — deployed on Railway|
|Frontend|Next.js 14, TypeScript, Tailwind CSS — deployed on Vercel|
|Training|AWS SageMaker|

\---

## Project Structure

```
├── backend/
│   ├── main.py          # FastAPI app + inference endpoint
│   ├── detector.py      # YOLOv8 inference logic (normalised bbox output)
│   ├── prices.json      # Item price mappings
│   ├── model.pt         # Trained YOLOv8s weights
│   ├── Dockerfile       # Railway deployment
│   └── requirements.txt
└── frontend/
    ├── app/             # Next.js pages + layout
    ├── components/      # Camera.tsx, CartPanel.tsx, Receipt.tsx
    ├── hooks/           # useCamera.ts, useDetection.ts
    └── types/           # Shared TypeScript types
```

\---

## Run Locally

**Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API available at http://localhost:8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:3000
```

> `model.pt` is included in the `backend/` folder — no separate download needed.

\---

## Key Design Decisions

* **Confidence + frame threshold filtering** — requiring 5 consecutive frames at ≥65% confidence before logging an item prevents transient false positives from cluttering the bill
* **Normalised bounding boxes** — the backend returns coordinates as 0–1 ratios so the frontend can scale them to any canvas size without server-side knowledge of display resolution
* **Decoupled frontend/backend** — FastAPI backend deployed independently on Railway; Next.js frontend on Vercel — allows each layer to scale independently

\---

## Academic Context

This project was developed as part of a deep learning group project benchmarking object detection architectures (YOLOv8s, Faster R-CNN, SSD-MobileNet) on a grocery dataset in COCO format, trained on AWS SageMaker. The final system achieved a mAP@0.5 of **0.9567** using YOLOv8s.

