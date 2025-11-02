// server.js
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const Jimp = require("jimp");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Lubame CORS ja failide üleslaadimise
app.use(cors());
app.use(fileUpload());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
// Põhileht
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Stencil-pildi genereerimine
app.post("/stencil", async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).send("Pilt puudub!");
    }

    const imageFile = req.files.image;
    const tempPath = path.join(__dirname, "temp.jpg");

    // Salvesta üleslaetud pilt
    await imageFile.mv(tempPath);

    // Lae pilt Jimp'iga ja töötle
    const image = await Jimp.read(tempPath);
    image
      .grayscale() // mustvalge
      .contrast(1) // suurenda kontrasti
      .normalize() // tasakaalusta heledus
      .posterize(2); // tee tugev stencil-tunne

    // Saada pilt tagasi brauserisse base64 kujul
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    res.set("Content-Type", "image/jpeg");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Pildi töötlemine ebaõnnestus!");
  }
});

// Käivita server
app.listen(PORT, () => {
  console.log(`✅ Server töötab pordil ${PORT}`);
});
