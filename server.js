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
      return res.status(400).json({ error: "Pilt puudub!" });
    }

    const image = req.files.image;
    const formData = new FormData();
    formData.append("image", image.data, image.name);

    console.log("📤 Saadan pildi DeepAI API-le...");

    const response = await fetch("https://api.deepai.org/api/line-drawing", {
      method: "POST",
      headers: {
        "Api-Key": process.env.DEEPAI_KEY,
      },
      body: formData,
    });

    const data = await response.json();
    console.log("🔎 DeepAI vastus:", data);

    if (data.output_url) {
      return res.json({ output_url: data.output_url });
    } else {
      return res
        .status(500)
        .json({ error: "DeepAI ei tagastanud pilti", detail: data });
    }
  } catch (err) {
    console.error("❌ Serveri viga:", err);
    res.status(500).json({ error: "Serveri viga", detail: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server töötab pordil ${PORT}`));
