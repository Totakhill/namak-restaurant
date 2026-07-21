const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const outputDirectory = path.join(projectRoot, "www");

const webSources = [
  "index.html",
  "fa",
  "ps",
  "assets"
];

console.log("Building Namak Restaurant mobile web bundle...");

fs.rmSync(outputDirectory, {
  recursive: true,
  force: true
});

fs.mkdirSync(outputDirectory, {
  recursive: true
});

for (const source of webSources) {
  const sourcePath = path.join(projectRoot, source);
  const destinationPath = path.join(outputDirectory, source);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Required mobile source is missing: ${source}`);
  }

  fs.cpSync(sourcePath, destinationPath, {
    recursive: true
  });

  console.log(`Copied: ${source}`);
}

console.log("");
console.log("Mobile web bundle created successfully.");
console.log(`Output: ${outputDirectory}`);
