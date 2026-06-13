"use client";
import { CartItem } from "@/types";
import { TAX_RATE } from "@/components/CartPanel";

interface Props {
  cart: CartItem[];
  onClose: () => void;
}

export default function Receipt({ cart, onClose }: Props) {
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const receiptNumber = `RCP-${Date.now().toString().slice(-6)}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });


  return (
    <div className="receipt-modal fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs print:shadow-none print:rounded-none print:max-w-full">
        {/* Screen-only header */}
        <div className="flex items-center justify-between px-5 py-4 border-b print:hidden">
          <p className="text-sm font-semibold text-slate-700">Receipt Preview</p>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Receipt body */}
        <div id="receipt-content" className="px-6 py-5 font-mono text-sm">
          <div className="text-center space-y-0.5 mb-4">
            <h1 className="text-lg font-extrabold tracking-widest text-slate-700">Fresh Food Grocery</h1>
            <p className="text-xs text-slate-600">Freshness in every basket</p>
          </div>

          <div className="border-t border-dashed border-slate-300 my-3" />

          <div className="text-center text-xs text-slate-700 space-y-0.5 mb-3">
            <p>{dateStr} &nbsp; {timeStr}</p>
            <p className="font-semibold">#{receiptNumber}</p>
          </div>

          <div className="border-t border-dashed border-slate-300 my-3" />

          {/* Column header */}
          <div className="grid grid-cols-12 text-xs text-slate-600 font-semibold mb-2">
            <span className="col-span-4">ITEM</span>
            <span className="col-span-2 text-center">QTY</span>
            <span className="col-span-3 text-right">UNIT</span>
            <span className="col-span-3 text-right">AMT</span>
          </div>

          {/* Items */}
          <div className="space-y-1 mb-3">
            {cart.map((item) => (
              <div key={item.name} className="grid grid-cols-12 text-xs text-slate-400">
                <span className="col-span-4 capitalize truncate">{item.name}</span>
                <span className="col-span-2 text-center">{item.quantity}</span>
                <span className="col-span-3 text-right">{item.unitPrice.toFixed(2)}</span>
                <span className="col-span-3 text-right font-semibold">
                  {(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-300 my-3" />

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-700">
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>GST (10%)</span><span>${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300 my-2" />

          <div className="flex justify-between font-extrabold text-slate-700">
            <span>TOTAL</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="border-t border-dashed border-slate-300 my-3" />
          <p className="text-center text-xs text-slate-600">Thank you for your purchase!</p>
        </div>

        {/* Screen-only print button */}
        <div className="px-5 pb-5 print:hidden">
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
            </svg>
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
