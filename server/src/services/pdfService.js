import mupdf from "mupdf";
import { exportImages } from "pdf-export-images";
import fs from "fs";
import path from "path";

export const convertPdfToImages = async (pdfPath, tempDir) => {
    try {
        const prefix = `page_${Date.now()}`;
        const imagePaths = [];
        
        // Open PDF with MuPDF (pure WebAssembly, no OS binaries needed!)
        const doc = mupdf.Document.openDocument(pdfPath);
        const count = doc.countPages();
        
        for (let i = 0; i < count; i++) {
            const page = doc.loadPage(i);
            // Scale by 2 for higher resolution OCR reading
            const pix = page.toPixmap(mupdf.Matrix.scale(2, 2), mupdf.ColorSpace.DeviceRGB, false, true);
            const png = pix.asPNG();
            
            const imagePath = path.join(tempDir, `${prefix}-${i + 1}.png`);
            fs.writeFileSync(imagePath, png);
            imagePaths.push(imagePath);
        }

        return imagePaths;
    } catch (error) {
        console.error("Error converting PDF to images using mupdf:", error);
        throw error;
    }
};

export const extractRawImages = async (pdfPath, tempDir) => {
    try {
        const exported = await exportImages(pdfPath, tempDir);
        const imagePaths = exported.map(img => path.join(tempDir, img.name));
        return imagePaths;
    } catch (error) {
        console.error("Error extracting raw images natively (falling back to cropping):", error);
        return [];
    }
};
