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
      return res.status(400).json({ error: "Pildifail puudub!" });
    }

    const image = req.files.image;
    const formData = new FormData();
    formData.append("image", image.data, image.name);

    // 🔧 DeepAI päring
    const response = await fetch("https://api.deepai.org/api/line-drawing", {
      method: "POST",
      headers: {
        "Api-Key": process.env.DEEPAI_KEY,
      },
      body: formData,
    });

    // ✅ LOGIME RAW vastuse, et näha täpselt, mida DeepAI tagastab
    const rawResponse = await response.text();
    console.log("🔍 DeepAI toore vastus:", rawResponse);

    // ❗ Kommentaar: JSON-i parsimine on hetkel välja kommenteeritud
    // const data = await response.json();

    // Kui soovid: saad vajadusel JSON tagasi anda testiks
    return res.json({ raw: rawResponse });
  } catch (err) {
    console.error("❌ Serveri viga:", err);
    res.status(500).json({ error: "Serveri viga stencil genereerimisel." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`✅ Server töötab pordil ${PORT}`)
);
