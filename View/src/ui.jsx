const PATHS = {
  predict: "M3 11l9-8 9 8M5 9.5V20h5v-6h4v6h5V9.5",
  history: "M12 7v5l3 2M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8M3 3v5h5",
  search: "M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z",
  plus: "M12 5v14M5 12h14",
  pin: "M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11zM12 12a2 2 0 100-4 2 2 0 000 4z",
  home: "M4 20V8l8-5 8 5v12zM9 20v-6h6v6",
  ruler: "M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2",
  tag: "M3 12V4h8l10 10-8 8zM7.5 8.5h.01",
};

export const Icon = ({ n, className = "size-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={PATHS[n]} />
  </svg>
);

// Rupees -> "₹85.00 Lakh" / "₹1.20 Cr"
export const inr = (n) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : `₹${(n / 1e5).toFixed(2)} Lakh`;

export const ORANGE_BTN =
  "inline-flex items-center gap-1.5 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50";
