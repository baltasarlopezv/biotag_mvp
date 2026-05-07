const fs = require("fs");
const path = require("path");
const { pool } = require("./db");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDatabase(maxAttempts = 30, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await pool.query("select 1");
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      console.log(`Waiting for PostgreSQL... (${attempt}/${maxAttempts})`);
      await sleep(delayMs);
    }
  }
}

async function setup() {
  await waitForDatabase();
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);
  await pool.end();
  console.log("BioTag database schema ready");
}

setup().catch((error) => {
  console.error(error);
  process.exit(1);
});
