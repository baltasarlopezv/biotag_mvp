const { spawn } = require("node:child_process");

const env = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("npm_"))
);

delete env.NODE;
delete env.INIT_CWD;

const args = ["expo", "start", "--clear", "--port", "8081", ...process.argv.slice(2)];
const command = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(command, args, {
  env,
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
