import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const roots = ["html", "css", "js", "a11y", "tools", "recipes"];
const sourceRoot = process.argv[2] ?? "/tmp/doka-content";
const outputFile = new URL("../app/dokaReferenceSeeds.ts", import.meta.url);

function walk(dir, result = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, result);
    if (entry.isFile() && entry.name === "index.md") result.push(file);
  }

  return result;
}

function frontmatterValue(markdown, key) {
  const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const quoted = frontmatter.match(new RegExp(`^${key}:\\s*"([^"]*)"`, "m"));
  if (quoted) return quoted[1].trim();

  const plain = frontmatter.match(new RegExp(`^${key}:\\s*([^\\n]+)`, "m"));
  return plain?.[1].trim().replace(/^['"]|['"]$/g, "") ?? "";
}

function toLiteral(value) {
  return JSON.stringify(value);
}

const rows = [];

for (const section of roots) {
  const sectionRoot = path.join(sourceRoot, section);
  const files = walk(sectionRoot);

  for (const file of files) {
    const slug = path.relative(sectionRoot, path.dirname(file));
    if (!slug) continue;
    const markdown = readFileSync(file, "utf8");
    const title = frontmatterValue(markdown, "title") || slug;
    rows.push({ section, slug, title });
  }
}

rows.sort((a, b) => {
  const sectionOrder = roots.indexOf(a.section) - roots.indexOf(b.section);
  return sectionOrder || a.slug.localeCompare(b.slug, "ru");
});

const counts = roots
  .map((section) => `${section}: ${rows.filter((row) => row.section === section).length}`)
  .join(", ");

const body = rows
  .map((row) => `  [${toLiteral(row.section)}, ${toLiteral(row.slug)}, ${toLiteral(row.title)}],`)
  .join("\n");

writeFileSync(
  outputFile,
  `// Generated from the public Doka content repository.\n` +
    `// We keep only factual catalog metadata and generate original Front Gym Pro lessons from it.\n` +
    `// Source: https://github.com/doka-guide/content\n` +
    `// Counts: ${counts}\n` +
    `export const dokaReferenceSeeds = [\n${body}\n] as const;\n`,
);
