import express from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")));

app.post("/generate-stencil", async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "Faili ei saadetud!" });
    }

    const image = req.files.image;
    const formData = new FormData();
    formData.append("image", image.data, image.name);

    // Kasutame "sketch" mudelit (stabiilne versioon)
    const response = await fetch("https://api.deepai.org/api/sketch", {
      method: "POST",
      headers: {
        "Api-Key": process.env.DEEPAI_KEY,
      },
      body: formData,
    });

    // Logime RAW vastuse (et näha täpset viga)
    const text = await response.text();
    console.log("🧾 DeepAI RAW vastus:", text);

    // Proovime JSON-ina tõlgendada
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "DeepAI vastus ei olnud JSON", raw: text });
    }

    if (data.output_url) {
      return res.json({ output_url: data.output_url });
    } else {
      return res.status(500).json({ error: "DeepAI ei tagastanud pilti", details: data });
    }

  } catch (err) {
    console.error("❌ Serveri viga:", err);
    res.status(500).json({ error: "Serveri viga", details: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server töötab pordil ${PORT}`));
