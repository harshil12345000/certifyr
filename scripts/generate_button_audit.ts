import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../src");
const outputFile = path.resolve(__dirname, "../button_audit.csv");

const BUTTON_REGEXES = [
  /<Button[^>]*>([\s\S]*?)<\/Button>/g,
  /<button[^>]*>([\s\S]*?)<\/button>/g,
  /<Button[^>]*\/?>/g,
  /<button[^>]*\/?>/g,
  /onClick=\{([^}]+)\}/g,
  /type="submit"/g,
  /type="button"/g,
];

function walk(dir: string, filelist: string[] = []) {
  fs.readdirSync(dir).forEach((file) => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walk(filepath, filelist);
    } else if (filepath.endsWith(".tsx")) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function extractButtons(file: string): any[] {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");
  const results: any[] = [];
  lines.forEach((line, idx) => {
    BUTTON_REGEXES.forEach((regex) => {
      let match;
      while ((match = regex.exec(line))) {
        results.push({
          file: file.replace(projectRoot + path.sep, "src/"),
          line: idx + 1,
          snippet: line.trim(),
        });
      }
    });
  });
  return results;
}

function main() {
  const files = walk(projectRoot);
  const allButtons: any[] = [];
  files.forEach((file) => {
    allButtons.push(...extractButtons(file));
  });
  // Remove duplicates
  const unique = Array.from(
    new Set(allButtons.map((b) => `${b.file}:${b.line}`)),
  ).map((key) => allButtons.find((b) => `${b.file}:${b.line}` === key));

  // CSV header
  const header = "File,Line,Snippet\n";
  const rows = unique
    .map((b) => `${b.file},${b.line},"${b.snippet.replace(/"/g, '""')}"`)
    .join("\n");
  fs.writeFileSync(outputFile, header + rows);
}

main();
