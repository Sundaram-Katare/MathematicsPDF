import pdfPoppler from "pdf-poppler";
import { exportImages } from "pdf-export-images";
import fs from "fs";
import path from "path";

export const convertPdfToImages = async (pdfPath, tempDir) => {
    try {
        const prefix = `page_${Date.now()}`;
        const opts = {
            format: 'png',
            out_dir: tempDir,
            out_prefix: prefix,
            page: null 
        };

        await pdfPoppler.convert(pdfPath, opts);

        const files = fs.readdirSync(tempDir);
        
        const imagePaths = files
            .filter(file => file.startsWith(prefix) && file.endsWith('.png'))
            .map(file => path.join(tempDir, file))
            .sort((a, b) => {
                const numA = parseInt(a.match(/-(\d+)\.png$/)?.[1] || "0");
                const numB = parseInt(b.match(/-(\d+)\.png$/)?.[1] || "0");
                return numA - numB;
            });

        return imagePaths;
    } catch (error) {
        console.error("Error converting PDF to images using pdf-poppler:", error);
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
