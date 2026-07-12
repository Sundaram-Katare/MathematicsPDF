import fs from "fs";

export const removeFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error(`Failed to remove file ${filePath}:`, err);
    }
};

export const removeFiles = (filePaths) => {
    if (!Array.isArray(filePaths)) return;
    filePaths.forEach(removeFile);
};
