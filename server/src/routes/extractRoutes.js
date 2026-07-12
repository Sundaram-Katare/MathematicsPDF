import express from "express";
import multer from "multer";
import { extractQuestions } from "../controllers/extractController.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const upload = multer({ 
    dest: path.join(__dirname, "../../uploads"),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    }
});

router.post("/", upload.single("pdf"), extractQuestions);

export default router;
