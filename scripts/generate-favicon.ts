import sharp from "sharp";
import path from "path";

const inputImage = path.join(process.cwd(), "public", "lkc-logo.png");
const outputPath = path.join(process.cwd(), "public", "favicon.ico");

async function generateFavicon() {
  try {
    await sharp(inputImage)
      .resize(32, 32, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(outputPath);
    console.log("Favicon generated successfully!");
  } catch (error) {
    console.error("Error generating favicon:", error);
    process.exit(1);
  }
}

generateFavicon();
