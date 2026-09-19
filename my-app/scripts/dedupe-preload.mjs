import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node dedupe-preload.mjs <html-file>");
  process.exit(1);
}

const linkRe = /<link\b[^>]*\brel=["']preload["'][^>]*>/gi;
const hrefRe = /href=["']([^"']+)["']/;

let removed = 0;
let html = fs.readFileSync(file, "utf8");
const seen = new Set();

html = html.replace(linkRe, (tag) => {
  const href = hrefRe.exec(tag)?.[1];
  if (!href) return tag;
  if (seen.has(href)) {
    removed += 1;
    return "";
  }
  seen.add(href);
  return tag;
});

if (removed > 0) fs.writeFileSync(file, html);
console.log(`dedupe-preload: removed ${removed} duplicate preload link(s) from ${file}`);