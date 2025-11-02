import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";

const app = express();
const __dirname = path.resolve();

app.use(cors());
app.use(fileUpload());
app.use(express.static("public"));
app.use(express.json());

// Serveeri avaleht
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
