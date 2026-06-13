"use client";
import { CartItem } from "@/types";

export const TAX_RATE = 0.10;

interface Props {
  cart: CartItem[];
  onRemove: (name: string) => void;
  onClear: () => void;
  onReceipt: () => void;
  onDemo: () => void;
}

export default function CartPanel({ cart, onRemove, onClear, onReceipt, onDemo }: Props) {
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const itemCount = cart.reduce((n, item) => n + item.quantity, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Billing</h2>
          {itemCount > 0 && (
            <span className="text-xs font-bold bg-slate-800 text-white px-2 py-0.5 rounded-full">
              {itemCount}
            </span>
          )}
        </div>
        {cart.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-rose-500 transition-colors font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 px-6">
          <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">No items scanned</p>
            <p className="text-xs text-slate-400 mt-0.5">Press &ldquo;Start Detect&rdquo; to scan items</p>
          </div>
          <button
            onClick={onDemo}
            className="text-xs text-slate-400 hover:text-slate-600 border border-dashed border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            Load demo data
          </button>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className="grid grid-cols-12 text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-2 border-b border-slate-100 bg-slate-50">
            <span className="col-span-4">Item</span>
            <span className="col-span-2 text-center">Qty</span>
            <span className="col-span-3 text-right">Unit</span>
            <span className="col-span-3 text-right">Total</span>
          </div>

          {/* Item rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {cart.map((item) => (
              <div
                key={item.name}
                className="grid grid-cols-12 items-center px-4 py-2.5 hover:bg-slate-50 group transition-colors"
              >
                <div className="col-span-4 flex items-center gap-2">
                  <button
                    onClick={() => onRemove(item.name)}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-4 h-4 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all rounded"
                    title="Remove"
                  >
                    ✕
                  </button>
                  <span className="capitalize text-sm font-medium text-slate-700 truncate">{item.name}</span>
                </div>
                <span className="col-span-2 text-center text-sm text-slate-500 font-mono">×{item.quantity}</span>
                <span className="col-span-3 text-right text-sm text-slate-500 font-mono">
                  ${item.unitPrice.toFixed(2)}
                </span>
                <span className="col-span-3 text-right text-sm font-semibold text-slate-800 font-mono">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>GST (10%)</span>
              <span className="font-mono">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-base font-bold text-slate-800">Total</span>
              <span className="text-xl font-bold text-emerald-600 font-mono">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Receipt button */}
          <div className="px-4 pb-4 pt-3">
            <button
              onClick={onReceipt}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 active:bg-black text-white font-semibold py-3 rounded-xl transition-colors text-sm tracking-wide"
            >
              <ReceiptIcon />
              GENERATE RECEIPT
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ReceiptIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  );
}
