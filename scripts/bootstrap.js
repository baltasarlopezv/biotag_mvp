const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function copyEnvIfMissing() {
  const root = process.cwd();
  const source = path.join(root, ".env.example");
  const target = path.join(root, ".env");

  if (!fs.existsSync(source)) {
    console.error("Missing .env.example in project root.");
    process.exit(1);
  }

  if (!fs.existsSync(target)) {
    fs.copyFileSync(source, target);
    console.log("Created .env from .env.example");
  } else {
    console.log(".env already exists, keeping current file");
  }
}

function main() {
  console.log("== BioTag bootstrap ==");
  copyEnvIfMissing();

  console.log("Checking environment variables...");
  run("npm", ["run", "env:check"]);

  console.log("Starting local database (Docker)...");
  run("npm", ["run", "db:up"]);

  console.log("Applying database schema...");
  run("npm", ["run", "db:setup"]);

  console.log("Bootstrap finished.");
  console.log("Next steps:");
  console.log("- Terminal 1: npm run api");
  console.log("- Terminal 2: npm start");
}

main();
