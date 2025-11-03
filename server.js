const express = require('express');
const fileUpload = require('express-fileupload');
const Jimp = require('jimp');
const path = require('path');

const app = express();
app.use(require('cors')());
app.use(fileUpload());
app.use(express.static('public'));
app.use(express.json());

// POST /stencil - genereerib stencil'i ja tagastab PNG
app.post('/stencil', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).send('No image uploaded.');
    }

    const file = req.files.image;
    // parameetrid: thickness ja darkness
    const lineThickness = parseFloat(req.body.lineThickness) || 2;
    const darkness = parseFloat(req.body.darkness) || 1;

    // Loe pilt Jimpiga
    const image = await Jimp.read(file.data);

    // Standardiseerime mõõtmed (soovi korral)
    const maxDim = 1200;
    if (image.bitmap.width > maxDim || image.bitmap.height > maxDim) {
      image.scaleToFit(maxDim, maxDim);
    }

    // Töötle: grayscale -> kontrast -> slight blur -> posterize -> edge detect -> threshold
    image
      .grayscale()
      .contrast(0.2 * (darkness)) // tumeduse mõjutamine
      .posterize(8) // lihtsustab toonid
      .gaussian(1.2) // pehmendame noise'i
      .edgeDetect() // Jimp edge detect
      .invert(); // invertime (edgeDetect annab musta tausta ja valged jooned? katseta)

    // Threshold (muudame selgemaks)
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      // lihtne threshold
      const v = red > 120 ? 255 : 0;
      this.bitmap.data[idx + 0] = v;
      this.bitmap.data[idx + 1] = v;
      this.bitmap.data[idx + 2] = v;
      // hoidke alfa 255
    });

    // Teeme kontuuride paksust serveris väikese dilatatsiooniga (lineThickness)
    // Lihtne viis: joonistame mitu korda kerge nihkega, et joon paksuseks saada
    if (lineThickness && lineThickness > 1) {
      const copies = Math.max(1, Math.round(lineThickness));
      const base = image.clone();
      const w = image.bitmap.width;
      const h = image.bitmap.height;
      const canvas = new Jimp(w, h, 0x00000000); // läbipaistev baaspilt

      for (let dx = -Math.floor(copies/2); dx <= Math.floor(copies/2); dx++) {
        for (let dy = -Math.floor(copies/2); dy <= Math.floor(copies/2); dy++) {
          canvas.composite(base, dx, dy, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 1,
            opacityDest: 1
          });
        }
      }
      // kui composite tekitas tumeda tausta (0xff000000), me tagastame valge/must
      image.composite(canvas, 0, 0);
    }

    // Et tagastada läbipaistva taustaga: teisendame musta valgeks joonte jaoks ja muudame tausta läbipaistvaks
    // Loome uue pildi, kus must = joon ja valge = läbipaistvus
    const out = new Jimp(image.bitmap.width, image.bitmap.height, 0x00000000);
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const v = this.bitmap.data[idx]; // red
      // kui pixel on must (0) -> joon: tee must pixel
      if (v === 0) {
        out.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 255), x, y);
      } else {
        // valge -> täielik läbipaistvus
        out.setPixelColor(Jimp.rgbaToInt(255, 255, 255, 0), x, y);
      }
    });

    const buffer = await out.getBufferAsync(Jimp.MIME_PNG);
    res.set('Content-Type', 'image/png');
    return res.send(buffer);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Stencil generation failed.');
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
