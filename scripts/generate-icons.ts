import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const sizes = [192, 256, 384, 512];
const inputImage = path.join(process.cwd(), "public", "lkc-logo.png");
const outputDir = path.join(process.cwd(), "public");

async function generateIcons() {
  try {
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      await sharp(inputImage)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toFile(outputPath);
      console.log(`Generated ${size}x${size} icon`);
    }
    console.log("All icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

generateIcons();
