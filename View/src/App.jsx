import { useState } from "react";
import Predict from "./Predict.jsx";
import History from "./History.jsx";
import { Icon } from "./ui.jsx";

const NAV = [
  { id: "predict", label: "Predict", icon: "predict", Page: Predict },
  { id: "history", label: "History", icon: "history", Page: History },
];

export default function App() {
  const [tab, setTab] = useState("predict");
  const { label, icon, Page } = NAV.find((n) => n.id === tab);

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      <aside className="flex w-14 shrink-0 flex-col border-r border-slate-200 bg-slate-50 p-2 md:w-56 md:p-3">
        <div className="flex min-h-10 items-center gap-2 px-2 py-2">
          <img
            src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/homehub.webp"
            alt="HomeHub"
            className="size-6 shrink-0 object-contain"
          />
          <span className="hidden min-w-0 flex-col leading-tight md:flex">
            <span className="text-sm font-bold text-slate-900">
              Prop<span className="text-orange-600">Predict</span>
            </span>
            <span className="mt-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-orange-500" />
              Property estimates
            </span>
          </span>
        </div>
        <nav className="mt-4 space-y-1">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium ${
                tab === n.id ? "bg-white text-orange-600 shadow-sm" : "text-slate-600 hover:bg-white/70"}`}>
              <Icon n={n.icon} className="size-4 shrink-0" />
              <span className="hidden md:inline">{n.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-3 text-sm font-medium text-slate-600">
          <Icon n={icon} /> {label}
        </div>
        <Page />
      </div>
    </div>
  );
}
