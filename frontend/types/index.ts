export interface BBox {
  x1: number; // normalized 0-1
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  class: string;
  confidence: number;
  bbox: BBox;
  price: number;
}

export interface CartItem {
  name: string;
  quantity: number;
  unitPrice: number;
}
