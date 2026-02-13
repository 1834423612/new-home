import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const appDir = join(root, "app");
const src = join(publicDir, "logo.png");

async function generate() {
    const input = readFileSync(src);

    // 1. favicon.ico — 48x48 PNG wrapped as ICO
    //    Modern browsers accept PNG-based ICOs
    const ico16 = await sharp(input).resize(16, 16).png().toBuffer();
    const ico32 = await sharp(input).resize(32, 32).png().toBuffer();
    const ico48 = await sharp(input).resize(48, 48).png().toBuffer();

    // Build a simple ICO file containing 16, 32, 48 px images
    const icoBuffer = createIco([ico16, ico32, ico48], [16, 32, 48]);
    writeFileSync(join(appDir, "favicon.ico"), icoBuffer);
    console.log("✔ app/favicon.ico (16+32+48)");

    // 2. icon.png 32x32 — standard favicon
    await sharp(input).resize(32, 32).png().toFile(join(appDir, "icon.png"));
    console.log("✔ app/icon.png (32×32)");

    // 3. apple-icon.png 180x180 — Apple Touch Icon
    await sharp(input).resize(180, 180).png().toFile(join(appDir, "apple-icon.png"));
    console.log("✔ app/apple-icon.png (180×180)");

    // 4. Various sizes in /public for web manifest
    const manifestSizes = [192, 512];
    for (const size of manifestSizes) {
        await sharp(input)
            .resize(size, size)
            .png()
            .toFile(join(publicDir, `icon-${size}.png`));
        console.log(`✔ public/icon-${size}.png (${size}×${size})`);
    }

    console.log("\nAll favicons generated successfully!");
}

/**
 * Create a minimal ICO file from PNG buffers
 */
function createIco(pngBuffers, sizes) {
    const numImages = pngBuffers.length;
    const headerSize = 6;
    const dirEntrySize = 16;
    const dirSize = dirEntrySize * numImages;
    let offset = headerSize + dirSize;

    // ICO Header
    const header = Buffer.alloc(headerSize);
    header.writeUInt16LE(0, 0); // Reserved
    header.writeUInt16LE(1, 2); // Type: 1 = ICO
    header.writeUInt16LE(numImages, 4); // Number of images

    // Directory entries
    const dirEntries = [];
    for (let i = 0; i < numImages; i++) {
        const entry = Buffer.alloc(dirEntrySize);
        const size = sizes[i] >= 256 ? 0 : sizes[i];
        entry.writeUInt8(size, 0); // Width
        entry.writeUInt8(size, 1); // Height
        entry.writeUInt8(0, 2); // Color palette
        entry.writeUInt8(0, 3); // Reserved
        entry.writeUInt16LE(1, 4); // Color planes
        entry.writeUInt16LE(32, 6); // Bits per pixel
        entry.writeUInt32LE(pngBuffers[i].length, 8); // Size of image data
        entry.writeUInt32LE(offset, 12); // Offset to image data
        dirEntries.push(entry);
        offset += pngBuffers[i].length;
    }

    return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

generate().catch((err) => {
    console.error("Error generating favicons:", err);
    process.exit(1);
});
