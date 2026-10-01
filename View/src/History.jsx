import { useEffect, useState } from "react";
import { Icon, inr } from "./ui.jsx";

export default function History() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadHistory() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/history");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load history");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setRows([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadHistory(); }, []);

  const shown = (rows ?? []).filter((r) =>
    `${r.input.location} ${r.input.Property_Type} ${r.input.BHK}BHK`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">History</h1>
        <div className="flex w-72 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          <Icon n="search" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by location or type…"
                 className="w-full bg-transparent outline-none" />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg bg-slate-50">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs font-medium text-slate-500">
            <tr>{["Property", "Location", "Area", "Furnishing", "Estimated price", "Date"].map((h) => (
              <th key={h} className="px-4 py-3">{h}</th>))}</tr>
          </thead>
          <tbody className="bg-white">
            {shown.map((r) => (
              <tr key={r._id} className="border-b border-slate-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 font-semibold">
                    <span className="grid size-8 place-items-center rounded-full bg-orange-100 text-xs text-orange-600">{r.input.BHK}B</span>
                    {r.input.BHK} BHK {r.input.Property_Type}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{r.input.location}</td>
                <td className="px-4 py-3 text-slate-600">{r.input.Super_Area} sqft</td>
                <td className="px-4 py-3 text-slate-600">{r.input.Furnishing}</td>
                <td className="px-4 py-3 font-semibold text-orange-600">{inr(r.price)}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="bg-white py-10 text-center text-sm text-slate-500">Loading history…</p>}
        {error && (
          <div className="bg-white py-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button type="button" onClick={loadHistory}
              className="mt-3 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Retry
            </button>
          </div>
        )}
        {!loading && !error && rows && !shown.length && (
          <p className="bg-white py-10 text-center text-sm text-slate-500">No predictions yet</p>
        )}
      </div>
    </div>
  );
}
