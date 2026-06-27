import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules/@techstark/opencv-js/dist/opencv.js");
const destDir = join(root, "public/opencv");
const dest = join(destDir, "opencv.js");

if (!existsSync(source)) {
  console.warn("[copy-opencv] @techstark/opencv-js not installed, skipping.");
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(source, dest);
console.log("[copy-opencv] Copied opencv.js to public/opencv/");
