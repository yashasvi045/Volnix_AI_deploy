const fs = require("fs");
const path = require("path");

const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, "..", "service-account.json");

if (!fs.existsSync(inputPath)) {
  console.error(`Service account file not found: ${inputPath}`);
  process.exit(1);
}

const rawContents = fs.readFileSync(inputPath, "utf8");
const parsed = JSON.parse(rawContents);

if (typeof parsed.private_key === "string") {
  parsed.private_key = parsed.private_key.replace(/\r?\n/g, "\\n");
}

process.stdout.write(JSON.stringify(parsed));