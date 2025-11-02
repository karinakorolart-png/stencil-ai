// ✅ CommonJS versioon (Renderis täielikult töötav)

const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");

const app = express();

// Lubame vajalikud middlewares
app.use(cors());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// 🟢 Pealehe teenindamine (index.html fail public kaustas)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🟣 Serveri käivitamine
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
