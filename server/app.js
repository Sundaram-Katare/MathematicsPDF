import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import extractRoutes from "./src/routes/extractRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images from temp folder
app.use('/temp', express.static(path.join(__dirname, 'temp')));

app.use("/api/extract", extractRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || "Something went wrong!" });
});

export default app;
