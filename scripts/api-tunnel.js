const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const port = process.env.API_PORT || 4000;
const envFilePath = path.join(process.cwd(), ".env.api-tunnel");

function resolveNgrokPath() {
  if (process.env.NGROK_BIN) return process.env.NGROK_BIN;
  if (process.platform === "win32") return "ngrok.exe";

  const candidates = [
    "/opt/homebrew/bin/ngrok",
    "/usr/local/bin/ngrok",
    "/usr/bin/ngrok"
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || "ngrok";
}

function writeTunnelEnv(publicUrl) {
  fs.writeFileSync(envFilePath, `EXPO_PUBLIC_API_URL=${publicUrl}\n`);
  console.log(`✓ Saved tunnel URL to ${path.basename(envFilePath)}: ${publicUrl}`);
}

function extractPublicUrl(line) {
  // Match either old format: "Forwarding   https://xxxxx -> http://localhost:4000"
  // Or new ngrok v3 format: "url=https://xxxxx.ngrok-free.app"
  let match = line.match(/url=(https?:\/\/\S+)/);
  if (match) return match[1];
  
  match = line.match(/Forwarding\s+(https?:\/\/\S+)\s+->/);
  return match?.[1] || null;
}

console.log(`Starting ngrok tunnel on port ${port}...`);

const ngrokPath = resolveNgrokPath();
const child = spawn(ngrokPath, ["http", String(port), "--log=stdout"], {
  stdio: ["ignore", "pipe", "pipe"],
  detached: false
});

let tunnelUrlSaved = false;
let outputBuffer = "";

function handleOutput(chunk) {
  const text = chunk.toString().replace(/(Your authtoken:\s*)\S+/gi, "$1[redacted]");
  outputBuffer += text;
  process.stdout.write(text);

  if (tunnelUrlSaved) return;

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    
    const publicUrl = extractPublicUrl(line);
    if (publicUrl) {
      tunnelUrlSaved = true;
      writeTunnelEnv(publicUrl);
      break;
    }
  }
}

child.stdout.on("data", handleOutput);
child.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  process.stderr.write(text);
  handleOutput(chunk);
});

child.on("error", (err) => {
  console.error(`Failed to spawn ngrok: ${err.message}`);
  console.error("Make sure ngrok is installed: brew install ngrok");
  process.exit(1);
});

function printTroubleshooting() {
  if (/ERR_NGROK_4018|requires a verified account and authtoken/i.test(outputBuffer)) {
    console.error("ngrok requires a verified account and auth token.");
    console.error("Fix:");
    console.error("  1. Sign in at https://dashboard.ngrok.com/");
    console.error("  2. Copy your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken");
    console.error("  3. Run: ngrok config add-authtoken <YOUR_NGROK_TOKEN>");
    return;
  }

  if (/ERR_NGROK_107|authtoken.*invalid/i.test(outputBuffer)) {
    console.error("ngrok rejected the configured auth token as invalid.");
    console.error("Fix:");
    console.error("  1. Open https://dashboard.ngrok.com/get-started/your-authtoken");
    console.error("  2. Copy the current token from the same account you are using");
    console.error("  3. Run: ./node_modules/.bin/ngrok authtoken <YOUR_NGROK_TOKEN>");
    return;
  }

  if (/ERR_NGROK_121|version .* is too old/i.test(outputBuffer)) {
    console.error("ngrok is too old for this account.");
    console.error("Fix:");
    console.error("  1. Install or update ngrok v3: brew install ngrok/ngrok/ngrok");
    console.error("  2. Run: ngrok config add-authtoken <YOUR_NGROK_TOKEN>");
    console.error("  3. Run npm run api:tunnel again");
    return;
  }

  if (/bind: operation not permitted/i.test(outputBuffer)) {
    console.error("ngrok could not bind its local web interface.");
    console.error("Try running this command from your normal terminal instead of a restricted sandbox.");
    return;
  }

  console.error("Could not establish tunnel. Check:");
  console.error("  1. ngrok is installed (brew install ngrok)");
  console.error("  2. ngrok auth token is set (ngrok config add-authtoken <token>)");
  console.error(`  3. Port ${port} is accessible and npm run api is running`);
}

child.on("exit", (code, signal) => {
  if (signal) {
    console.log(`ngrok tunnel closed (signal: ${signal})`);
    process.kill(process.pid, signal);
    return;
  }

  if (code !== 0) {
    console.error(`ngrok exited with code ${code}`);
    if (!tunnelUrlSaved) {
      printTroubleshooting();
    }
  }

  process.exit(code ?? 0);
});
