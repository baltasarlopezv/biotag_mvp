const fs = require("node:fs");
const childProcess = require("node:child_process");
const Module = require("node:module");

const EXPO_NGROK_AUTH_TOKEN = "5W1bR67GNbWcXqmxZzBG1_56GezNeaX6sSRvn8npeQ8";

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

const systemNgrokPath = resolveNgrokPath();
const originalLoad = Module._load;
const originalSpawn = childProcess.spawn;
let activeProcess = null;

childProcess.spawn = function spawnWithNgrokV3(command, args = [], options) {
  if (
    command === systemNgrokPath &&
    Array.isArray(args) &&
    args[0] === "authtoken"
  ) {
    return originalSpawn.call(this, command, ["config", "add-authtoken", ...args.slice(1)], options);
  }

  return originalSpawn.call(this, command, args, options);
};

function extractPublicUrl(line) {
  let match = line.match(/url=(https?:\/\/\S+)/);
  if (match) return match[1];

  match = line.match(/Forwarding\s+(https?:\/\/\S+)\s+->/);
  return match?.[1] || null;
}

function getExpoNgrokUrl(options) {
  if (options.hostname) return options.hostname;
  if (options.subdomain) return `${options.subdomain}.exp.direct`;
  return null;
}

function createExpoNgrokModule() {
  return {
    async connect(options = {}) {
      await this.kill();

      const addr = options.addr || options.port || 8081;
      const args = [
        "http",
        String(addr),
        "--log=stdout",
        "--authtoken",
        options.authtoken || EXPO_NGROK_AUTH_TOKEN
      ];
      const publicHost = getExpoNgrokUrl(options);
      if (publicHost) args.push("--url", publicHost);

      const child = originalSpawn(systemNgrokPath, args, {
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true
      });

      activeProcess = child;

      return await new Promise((resolve, reject) => {
        let settled = false;

        function handleOutput(chunk) {
          const text = chunk.toString().replace(/(authtoken\s+)\S+/gi, "$1[redacted]");
          if (options.onLogEvent) options.onLogEvent(text.trim());
          if (/client session established|tunnel session started/i.test(text)) {
            options.onStatusChange?.("connected");
          }
          if (/session closed|session closing/i.test(text)) {
            options.onStatusChange?.("closed");
          }

          const url = extractPublicUrl(text);
          if (url && !settled) {
            settled = true;
            resolve(url);
          }
        }

        child.stdout.on("data", handleOutput);
        child.stderr.on("data", handleOutput);
        child.on("error", (error) => {
          if (!settled) {
            settled = true;
            reject(error);
          }
        });
        child.on("exit", (code) => {
          if (activeProcess === child) activeProcess = null;
          if (!settled) {
            settled = true;
            reject(new Error(`ngrok exited before opening Expo tunnel (code ${code})`));
          }
        });
      });
    },
    async disconnect() {
      await this.kill();
    },
    async kill() {
      if (!activeProcess) return;
      const child = activeProcess;
      activeProcess = null;
      child.kill();
      await new Promise((resolve) => child.once("exit", resolve));
    },
    getUrl() {
      return null;
    },
    getApi() {
      return null;
    },
    getActiveProcess() {
      return activeProcess;
    },
    async getVersion() {
      return await new Promise((resolve, reject) => {
        childProcess.execFile(systemNgrokPath, ["version"], (error, stdout) => {
          if (error) return reject(error);
          resolve(stdout.replace("ngrok version", "").trim());
        });
      });
    },
    NgrokClientError: class NgrokClientError extends Error {}
  };
}

function isExpoNgrokRequest(request) {
  return request === "@expo/ngrok" || /node_modules\/@expo\/ngrok\/index\.js$/.test(request);
}

Module._load = function loadWithSystemNgrok(request, parent, isMain) {
  if (request === "@expo/ngrok-bin") {
    return systemNgrokPath;
  }

  if (isExpoNgrokRequest(request)) {
    return createExpoNgrokModule();
  }

  return originalLoad.call(this, request, parent, isMain);
};
