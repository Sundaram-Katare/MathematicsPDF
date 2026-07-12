import sharp from "sharp";
import fs from "fs";
import path from "path";

export const cropQuestions = async (questions, imagePaths, tempDir) => {
    const croppedQuestions = [];

    const metadataCache = {};

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        if (!q.questionRegion) {
            croppedQuestions.push(q);
            continue;
        }

        const pageIndex = q.pageNumber - 1;
        if (pageIndex < 0 || pageIndex >= imagePaths.length) {
            console.warn(`Invalid page number ${q.pageNumber} for question ${q.questionNumber}`);
            croppedQuestions.push(q);
            continue;
        }

        const pageImagePath = imagePaths[pageIndex];

        if (!metadataCache[pageImagePath]) {
            metadataCache[pageImagePath] = await sharp(pageImagePath).metadata();
        }
        
        const { width, height } = metadataCache[pageImagePath];

        const { ymin, xmin, ymax, xmax } = q.questionRegion;

        const marginX = width * 0.02;
        const marginY = height * 0.02;

        let left = Math.floor(xmin * width - marginX);
        let top = Math.floor(ymin * height - marginY);
        let w = Math.ceil((xmax - xmin) * width + 2 * marginX);
        let h = Math.ceil((ymax - ymin) * height + 2 * marginY);

        left = Math.max(0, left);
        top = Math.max(0, top);
        if (left + w > width) w = width - left;
        if (top + h > height) h = height - top;

        const croppedFilename = `question_${q.questionNumber}_${Date.now()}.png`;
        const croppedPath = path.join(tempDir, croppedFilename);

        try {
            await sharp(pageImagePath)
                .extract({ left, top, width: w, height: h })
                .toFile(croppedPath);

            q.imageUrl = `/temp/${croppedFilename}`;
        } catch (err) {
            console.error(`Failed to crop question ${q.questionNumber}:`, err);
            q.imageUrl = null;
        }

        croppedQuestions.push(q);
    }

    return croppedQuestions;
};

export const cropDiagrams = async (questions, imagePaths, tempDir) => {
    const questionsWithDiagrams = [];

    const metadataCache = {};

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        if (!q.containsDiagram || !q.diagramRegion) {
            questionsWithDiagrams.push(q);
            continue;
        }

        const pageIndex = q.pageNumber - 1;
        if (pageIndex < 0 || pageIndex >= imagePaths.length) {
            console.warn(`Invalid page number ${q.pageNumber} for question ${q.questionNumber}`);
            questionsWithDiagrams.push(q);
            continue;
        }

        const pageImagePath = imagePaths[pageIndex];

        if (!metadataCache[pageImagePath]) {
            metadataCache[pageImagePath] = await sharp(pageImagePath).metadata();
        }
        
        const { width, height } = metadataCache[pageImagePath];

        const { ymin, xmin, ymax, xmax } = q.diagramRegion;

        const marginX = width * 0.02;
        const marginY = height * 0.02;

        let left = Math.floor(xmin * width - marginX);
        let top = Math.floor(ymin * height - marginY);
        let w = Math.ceil((xmax - xmin) * width + 2 * marginX);
        let h = Math.ceil((ymax - ymin) * height + 2 * marginY);

        left = Math.max(0, left);
        top = Math.max(0, top);
        if (left + w > width) w = width - left;
        if (top + h > height) h = height - top;

        const croppedFilename = `diagram_${q.questionNumber}_${Date.now()}.png`;
        const croppedPath = path.join(tempDir, croppedFilename);

        try {
            await sharp(pageImagePath)
                .extract({ left, top, width: w, height: h })
                .toFile(croppedPath);

            q.diagramUrl = `/temp/${croppedFilename}`;
        } catch (err) {
            console.error(`Failed to crop diagram for question ${q.questionNumber}:`, err);
            q.diagramUrl = null;
        }

        questionsWithDiagrams.push(q);
    }

    return questionsWithDiagrams;
};

