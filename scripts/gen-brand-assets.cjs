/* One-off: generate Enuygun-branded favicon set + og-image from the brand
 * palette and the white wordmark logo. Run: node scripts/gen-brand-assets.cjs */
const sharp = require("sharp");
const path = require("path");

const PUB = path.resolve(__dirname, "..", "client", "public");
const P1 = "#6B3480"; // topBar purple
const P2 = "#7c4dff"; // navBar violet

// Square emblem: rounded purple gradient tile + white "E" monogram (vector
// rects so it renders crisp at every size, no font dependency).
const emblemSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${P1}"/>
      <stop offset="1" stop-color="${P2}"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="512" height="512" rx="112" ry="112" fill="url(#g)"/>
  <g fill="#ffffff">
    <rect x="180" y="140" width="46" height="232" rx="8"/>
    <rect x="180" y="140" width="152" height="46" rx="8"/>
    <rect x="180" y="233" width="120" height="44" rx="8"/>
    <rect x="180" y="326" width="152" height="46" rx="8"/>
  </g>
</svg>`;

async function main() {
  const emblem = Buffer.from(emblemSvg);
  const png512 = await sharp(emblem).resize(512, 512).png().toBuffer();

  await sharp(png512).toFile(path.join(PUB, "favicon-512.png"));
  await sharp(png512).resize(192, 192).png().toFile(path.join(PUB, "favicon-192.png"));
  await sharp(png512).resize(48, 48).png().toFile(path.join(PUB, "favicon.png"));
  await sharp(png512).resize(256, 256).webp({ quality: 90 }).toFile(path.join(PUB, "favicon.webp"));

  // OG share image 1200x630: purple gradient + centered white wordmark + slogan.
  const ogBg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${P1}"/>
        <stop offset="1" stop-color="${P2}"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="1200" height="630" fill="url(#g)"/>
  </svg>`);

  const wordmark = await sharp(path.join(PUB, "logo-enuygun.webp"))
    .resize({ width: 760 })
    .toBuffer();
  const wmMeta = await sharp(wordmark).metadata();

  const textSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <style>
      .s { font-family: 'DejaVu Sans', sans-serif; font-weight: bold; fill: #ffffff; }
    </style>
    <text x="600" y="430" text-anchor="middle" class="s" font-size="46">Samsun'un Hızlı Pet Shop'u</text>
    <text x="600" y="500" text-anchor="middle" class="s" font-size="34" opacity="0.92">Aynı Gün Teslimat • Kapıda Ödeme</text>
  </svg>`);

  const wmTop = Math.round(200 - (wmMeta.height || 177) / 2 + 30);
  await sharp(ogBg)
    .composite([
      { input: wordmark, top: wmTop, left: Math.round((1200 - (wmMeta.width || 760)) / 2) },
      { input: textSvg, top: 0, left: 0 },
    ])
    .webp({ quality: 88 })
    .toFile(path.join(PUB, "og-image.webp"));

  console.log("done", { wmMeta });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
