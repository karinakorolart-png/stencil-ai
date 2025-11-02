const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const Jimp = require("jimp");

const app = express();
app.use(cors());
app.use(fileUpload());
app.use(express.static("public"));
app.use(express.json());

app.post("/stencil", async (req, res) => {
  try {
    const file = req.files.image;
    const lineThickness = parseFloat(req.body.lineThickness) || 1.0;
    const darkness = parseFloat(req.body.darkness) || 1.0;

    const image = await Jimp.read(file.data);
    image
      .grayscale()
      .contrast(darkness - 1)
      .posterize(3)
      .resize(800, Jimp.AUTO)
      .gaussian(lineThickness)
      .edgeDetect();

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Stencil generation failed.");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
