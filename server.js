const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Teeninda avaleht
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
