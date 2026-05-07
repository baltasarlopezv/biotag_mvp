const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const port = process.env.API_PORT || 4000;
const envFilePath = path.join(process.cwd(), ".env.api-tunnel");

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

const ngrokPath = process.platform === "win32" ? "ngrok.exe" : "ngrok";
const child = spawn(ngrokPath, ["http", String(port), "--log=stdout"], {
  stdio: ["ignore", "pipe", "pipe"],
  detached: false
});

let tunnelUrlSaved = false;

function handleOutput(chunk) {
  const text = chunk.toString();
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

child.on("exit", (code, signal) => {
  if (signal) {
    console.log(`ngrok tunnel closed (signal: ${signal})`);
    process.kill(process.pid, signal);
    return;
  }

  if (code !== 0) {
    console.error(`ngrok exited with code ${code}`);
    if (!tunnelUrlSaved) {
      console.error("Could not establish tunnel. Check:");
      console.error("  1. ngrok is installed (brew install ngrok)");
      console.error("  2. ngrok auth token is set (ngrok auth <token>)");
      console.error("  3. Port 4000 is accessible");
    }
  }

  process.exit(code ?? 0);
});
