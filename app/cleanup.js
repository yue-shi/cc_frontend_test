import fs from 'fs/promises';
import path from 'path';
import {screenshotDir, traceDir} from './config.js';

const foldersToClean = [screenshotDir, traceDir];

async function cleanFolder(folder) {
    try {
        const dirPath = path.resolve(folder);
        const files = await fs.readdir(dirPath);

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = await fs.lstat(filePath);

            if (file === '.gitignore' || stat.isDirectory()) continue;

            await fs.unlink(filePath);

            console.log(`Deleted: ${filePath}`);
        }
    } catch (err) {
        console.error(`Error cleaning folder "${folder}":`, err.message);
    }
}

async function runCleanup() {
    for (const folder of foldersToClean) {
        await cleanFolder(folder);
    }

    console.log('✅ Cleanup completed.');
}

runCleanup();