import express from "express";
import cors from "cors";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

// Lihtne "puhas joonistus" filter (mustad jooned valgel)
app.post("/stencil", upload.single("image"), async (req, res) => {
  try {
    const input = req.file.path;
    const output = `output-${Date.now()}.png`;

    await sharp(input)
      .greyscale()
      .threshold(150) // must-valge kontrast
      .toColourspace("b-w")
      .toFile(output);

    const img = fs.readFileSync(output);
    res.set("Content-Type", "image/png");
    res.send(img);

    fs.unlinkSync(input);
    fs.unlinkSync(output);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stencil creation failed" });
  }
});

app.listen(10000, () => console.log("✅ Server running on port 10000"));
