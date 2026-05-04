const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env");

if (!fs.existsSync(envPath)) {
  console.error("Missing .env file. Copy .env.example to .env first.");
  process.exit(1);
}

const requiredKeys = ["API_PORT", "JWT_SECRET", "DATABASE_URL", "EXPO_PUBLIC_API_URL"];
const raw = fs.readFileSync(envPath, "utf8");

const values = {};
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx <= 0) continue;
  const key = trimmed.slice(0, idx).trim();
  const value = trimmed.slice(idx + 1).trim();
  values[key] = value;
}

const missing = requiredKeys.filter((key) => !values[key]);

if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Environment check passed.");
