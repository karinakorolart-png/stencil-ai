import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import fetch from "node-fetch";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));

app.post("/generate-stencil", async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "Pildi fail on puudu." });
    }

    const image = req.files.image;
    const filePath = `/tmp/${image.name}`;
    await image.mv(filePath);

    const formData = new FormData();
    formData.append("image", fs.createReadStream(filePath));

    const response = await fetch("https://api.deepai.org/api/stencil", {
      method: "POST",
      headers: { "api-key": process.env.DEEPAI_API_KEY },
      body: formData,
    });

    const data = await response.json();
    if (!data.output_url) {
      return res.status(500).json({ error: "Stencil genereerimine ebaõnnestus." });
    }

    res.json({ output_url: data.output_url });
  } catch (err) {
    console.error("Viga genereerimisel:", err);
    res.status(500).json({ error: "Serveri viga stencil genereerimisel." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server töötab portil ${PORT}`));
