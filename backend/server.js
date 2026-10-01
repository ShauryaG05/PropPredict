import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const { PORT = 5001, MONGO_URI = "mongodb://127.0.0.1:27017/houseprice",
        MODEL_URL = "http://127.0.0.1:8000/predict" } = process.env;

const NUM = ["Bathroom", "Balcony", "BHK", "Carpet_Area", "Super_Area", "Current_Floor", "Total_Floors", "Parking_Count"];
const STR = ["location", "Furnishing", "facing", "Ownership", "Property_Type", "Parking_Type"];
const BOOL = ["overlooking_Garden_Park", "overlooking_Main_Road", "overlooking_Pool", "Has_Society"];

const Prediction = mongoose.model("Prediction", new mongoose.Schema(
  { input: Object, price: Number }, { timestamps: true }));
mongoose.connect(MONGO_URI).catch((e) => console.error("Mongo down, history disabled:", e.message));

const app = express();
app.use(cors(), express.json());

app.post("/api/predict", async (req, res) => {
  const b = req.body, input = {};
  for (const k of NUM) {
    input[k] = Number(b[k]);
    if (b[k] === "" || b[k] == null || !Number.isFinite(input[k]) || input[k] < 0)
      return res.status(400).json({ error: `${k} must be a non-negative number` });
  }
  for (const k of STR) {
    if (!b[k]) return res.status(400).json({ error: `${k} is required` });
    input[k] = String(b[k]);
  }
  for (const k of BOOL) input[k] = b[k] ? 1 : 0;
  if (input.Current_Floor > input.Total_Floors)
    return res.status(400).json({ error: "Current_Floor cannot exceed Total_Floors" });

  try {
    const r = await fetch(MODEL_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: data.error || "model error" });
    Prediction.create({ input, price: data.price }).catch(() => {}); // history is best-effort
    res.json({ price: data.price });
  } catch {
    res.status(502).json({ error: "model service unreachable" });
  }
});

app.get("/api/history", async (_, res) => {
  if (mongoose.connection.readyState !== 1)
    return res.status(503).json({ error: "History is unavailable because MongoDB is not connected" });

  try {
    const predictions = await Prediction.find().sort({ createdAt: -1 }).limit(20);
    return res.json(predictions);
  } catch (error) {
    console.error("Could not load prediction history:", error.message);
    return res.status(503).json({ error: "Could not load prediction history" });
  }
});

app.listen(PORT, () => console.log(`API on :${PORT}`));
