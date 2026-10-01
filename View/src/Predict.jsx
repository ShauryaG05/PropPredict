import { useState } from "react";
import { Icon, inr, ORANGE_BTN } from "./ui.jsx";

// Select options MUST match the category values your model saw in training.
const COLS = [
  {
    title: "Location & Type", bar: "border-blue-500", badge: "bg-blue-100 text-blue-600",
    fields: [
      { k: "location", label: "Location", options: ["agra", "ahmadnagar", "ahmedabad", "allahabad", "aurangabad", "badlapur", "bangalore", "belgaum", "bhiwadi", "bhiwandi", "bhopal", "bhubaneswar", "chandigarh", "chennai", "coimbatore", "dehradun", "durgapur", "ernakulam", "faridabad", "ghaziabad", "goa", "greater-noida", "guntur", "gurgaon", "guwahati", "gwalior", "haridwar", "hyderabad", "indore", "jabalpur", "jaipur", "jamshedpur", "jodhpur", "kalyan", "kanpur", "kochi", "kolkata", "kozhikode", "lucknow", "ludhiana", "madurai", "mangalore", "mohali", "mumbai", "mysore", "nagpur", "nashik", "navi-mumbai", "navsari", "nellore", "new-delhi", "noida", "palakkad", "palghar", "panchkula", "patna", "pondicherry", "pune", "raipur", "rajahmundry", "ranchi", "satara", "shimla", "siliguri", "solapur", "sonipat", "surat", "thane", "thrissur", "tirupati", "trichy", "trivandrum", "udaipur", "udupi", "vadodara", "vapi", "varanasi", "vijayawada", "visakhapatnam", "vrindavan", "zirakpur"] },
      { k: "Property_Type", label: "Property type", options: ["Builder Floor", "Flat", "House", "Penthouse", "Villa"] },
      { k: "BHK", label: "BHK", type: "number" },
      { k: "Ownership", label: "Ownership", options: ["Co-operative Society", "Freehold", "Leasehold", "Power Of Attorney", "Unknown"] },
    ],
  },
  {
    title: "Size & Floors", bar: "border-orange-500", badge: "bg-orange-100 text-orange-600",
    fields: [
      { k: "Carpet_Area", label: "Carpet area (sqft)", type: "number" },
      { k: "Super_Area", label: "Super area (sqft)", type: "number" },
      { k: "Bathroom", label: "Bathrooms", type: "number" },
      { k: "Balcony", label: "Balconies", type: "number" },
      { k: "Current_Floor", label: "Current floor", type: "number" },
      { k: "Total_Floors", label: "Total floors", type: "number" },
    ],
  },
  {
    title: "Features", bar: "border-green-500", badge: "bg-green-100 text-green-600",
    fields: [
      { k: "Furnishing", label: "Furnishing", options: ["Unfurnished", "Semi-Furnished", "Furnished"] },
      { k: "facing", label: "Facing", options: ["East", "North", "North - East", "North - West", "South", "South - East", "South -West", "Unknown", "West"] },
      { k: "Parking_Count", label: "Parking count", type: "number" },
      { k: "Parking_Type", label: "Parking type", options: ["Covered", "Open"] },
      { k: "overlooking_Garden_Park", label: "Garden / Park view", type: "chip" },
      { k: "overlooking_Main_Road", label: "Main road view", type: "chip" },
      { k: "overlooking_Pool", label: "Pool view", type: "chip" },
      { k: "Has_Society", label: "In a society", type: "chip" },
    ],
  },
];

const input = "mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-orange-500";
const filled = (form, fields) => fields.filter((f) => f.type === "chip" || (form[f.k] ?? "") !== "").length;

const Col = ({ title, bar, badge, count, children }) => (
  <section className="self-start rounded-lg border border-slate-200 bg-slate-50">
    <header className={`flex items-center justify-between border-l-2 border-dashed px-3 py-2.5 text-sm font-semibold ${bar}`}>
      {title}
      <span className={`rounded px-1.5 text-xs ${badge}`}>{count}</span>
    </header>
    <div className="space-y-3 border-t border-slate-200 bg-white p-3">{children}</div>
  </section>
);

const Row = ({ icon, label, value }) => (
  <div className="flex items-start justify-between gap-3 text-xs">
    <span className="flex items-center gap-1.5 text-slate-500"><Icon n={icon} className="size-3.5" />{label}</span>
    <span className="text-right font-medium">{value}</span>
  </div>
);

export default function Predict() {
  const [form, setForm] = useState({});
  const [price, setPrice] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError(""); setPrice(null);
    try {
      const r = await fetch("/api/predict", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Request failed");
      setPrice(data.price);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="predict" onSubmit={submit} className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Predict Price</h1>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { setForm({}); setPrice(null); setError(""); }}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Reset
          </button>
          <button disabled={loading} className={ORANGE_BTN}>
            {loading ? "Predicting…" : <>Predict Price <Icon n="plus" /></>}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLS.map(({ title, bar, badge, fields }) => (
          <Col key={title} title={title} bar={bar} badge={badge} count={`${filled(form, fields)}/${fields.length}`}>
            {fields.filter((f) => f.type !== "chip").map(({ k, label, type, options }) => (
              <label key={k} className="block text-xs font-medium text-slate-500">
                {label}
                {options ? (
                  <select required className={input} value={form[k] ?? ""} onChange={(e) => set(k, e.target.value)}>
                    <option value="" disabled>Select…</option>
                    {options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input required type="number" min="0" className={input} value={form[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
                )}
              </label>
            ))}
            <div className="flex flex-wrap gap-2">
              {fields.filter((f) => f.type === "chip").map(({ k, label }) => (
                <button type="button" key={k} onClick={() => set(k, !form[k])}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    form[k] ? "border-orange-200 bg-orange-50 text-orange-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                  {label}
                </button>
              ))}
            </div>
          </Col>
        ))}

        <Col title="Estimate" bar="border-amber-500" badge="bg-amber-100 text-amber-600" count={price == null ? 0 : 1}>
          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          {price == null && !error && (
            <p className="py-8 text-center text-sm text-slate-500">Fill in the details and click Predict Price</p>
          )}
          {price != null && (
            <>
              <div className="rounded-md bg-orange-50 p-4 text-center">
                <p className="text-xs font-medium text-orange-700">Estimated price</p>
                <p className="mt-1 text-3xl font-bold text-orange-600">{inr(price)}</p>
              </div>
              <Row icon="home" label="Property" value={`${form.BHK} BHK ${form.Property_Type}`} />
              <Row icon="pin" label="Location" value={form.location} />
              <Row icon="ruler" label="Super area" value={`${form.Super_Area} sqft`} />
              <Row icon="tag" label="Rate" value={`₹${Math.round(price / form.Super_Area).toLocaleString("en-IN")} / sqft`} />
            </>
          )}
        </Col>
      </div>
    </form>
  );
}
