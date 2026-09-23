import fs from "node:fs";
import path from "node:path";

const [index, notFound] = process.argv.slice(2);
if (!index || !notFound) {
  console.error("usage: node spa-fallback.mjs <out/index.html> <out/404.html>");
  process.exit(1);
}

const APP_SHELL_RE = /<iframe\b/;

if (!fs.existsSync(index)) {
  console.error(`spa-fallback: missing ${index}`);
  process.exit(1);
}

const html = fs.readFileSync(index, "utf8");
if (!APP_SHELL_RE.test(html)) {
  console.error(`spa-fallback: ${index} does not look like the app shell; aborting`);
  process.exit(1);
}

fs.copyFileSync(index, notFound);
console.log(`spa-fallback: ${path.basename(notFound)} now serves the app shell for GitHub Pages`);