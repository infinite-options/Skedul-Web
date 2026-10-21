#!/usr/bin/env node
/**
 * Netlify build entrypoint (local CLI + Netlify CI).
 *
 * Create React App inlines REACT_APP_* at build time, and values already in
 * the environment win over `.env`. Netlify can inject private site env as
 * **** placeholders, which would ship a broken bundle.
 *
 * This script loads local `.env` with override (or materializes it on CI),
 * drops masked values, then runs `npm run build`.
 *
 * Routine publishes use `npm run deploy` / `npm run deploy:draft`. Those
 * build here, then upload `build/` with `netlify deploy` (no `--build`).
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "..", ".env");
const REQUIRED = [
  "REACT_APP_SERVER_BASE_URI",
  "REACT_APP_GOOGLE_API_KEY",
  "REACT_APP_GOOGLE_CLIENT_ID",
];

function looksMasked(value) {
  const s = String(value ?? "");
  return s.length > 0 && /^\*+[A-Za-z0-9_-]*$/.test(s);
}

function stripMaskedReactApp(env) {
  for (const key of Object.keys(env)) {
    if (!key.startsWith("REACT_APP_")) continue;
    if (!env[key] || looksMasked(env[key])) {
      delete env[key];
    }
  }
}

function assertPublishable(env) {
  const base = env.REACT_APP_SERVER_BASE_URI || "";
  const mapsKey = env.REACT_APP_GOOGLE_API_KEY || "";
  const clientId = env.REACT_APP_GOOGLE_CLIENT_ID || "";

  console.log(
    `[netlify-build] REACT_APP_SERVER_BASE_URI=${base ? base.replace(/^(https?:\/\/[^/]+).*/, "$1") : "(empty)"}`,
  );
  console.log(
    `[netlify-build] REACT_APP_GOOGLE_API_KEY ends with ${mapsKey ? mapsKey.slice(-6) : "(empty)"} masked=${looksMasked(mapsKey)}`,
  );

  const problems = [];
  if (!base || looksMasked(base) || !/^https?:\/\/\S+$/.test(base)) {
    problems.push("REACT_APP_SERVER_BASE_URI is missing, masked, or not an http(s) URL");
  }
  if (!mapsKey || looksMasked(mapsKey) || !mapsKey.startsWith("AIza")) {
    problems.push("REACT_APP_GOOGLE_API_KEY is missing, masked, or not a real Google key");
  }
  if (!clientId || looksMasked(clientId) || !clientId.includes(".apps.googleusercontent.com")) {
    problems.push("REACT_APP_GOOGLE_CLIENT_ID is missing, masked, or not a Google OAuth client id");
  }
  if (problems.length) {
    for (const problem of problems) {
      console.error(`[netlify-build] Refusing to build: ${problem}.`);
    }
    console.error("[netlify-build] Put real values in local .env (see .env.example), then npm run deploy");
    process.exit(1);
  }
}

function buildChildEnv() {
  const env = { ...process.env };
  stripMaskedReactApp(env);

  if (fs.existsSync(envPath)) {
    const parsed = dotenv.parse(fs.readFileSync(envPath));
    for (const [key, value] of Object.entries(parsed)) {
      if (!key) continue;
      if (looksMasked(value)) {
        console.warn(`[netlify-build] Skipping masked value in .env: ${key}`);
        continue;
      }
      env[key] = value;
    }
    console.log(`[netlify-build] Loaded local ${envPath} into build env (overrides Netlify site env)`);
  } else if (process.env.NETLIFY) {
    const lines = Object.entries(env)
      .filter(([key, value]) => key.startsWith("REACT_APP_") && value && !looksMasked(value))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`);

    const present = new Set(lines.map((line) => line.slice(0, line.indexOf("="))));
    const missing = REQUIRED.filter((key) => !present.has(key));
    if (missing.length) {
      console.error(
        `[netlify-build] Netlify site env is missing real values for: ${missing.join(", ")}`,
      );
      console.error("[netlify-build] Use a machine with a real local .env: npm run deploy");
      process.exit(1);
    }

    fs.writeFileSync(envPath, `${lines.join("\n")}\n`, "utf8");
    console.log(`[netlify-build] Wrote ${envPath} for Netlify CI (${lines.length} keys)`);
  } else {
    console.error(`[netlify-build] No ${envPath}. Copy .env.example to .env and fill in the values.`);
    process.exit(1);
  }

  // Netlify sets CI=true, which makes Create React App fail the build on lint warnings.
  env.CI = "false";
  assertPublishable(env);
  return env;
}

const env = buildChildEnv();
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(npm, ["run", "build"], {
  env,
  stdio: "inherit",
  cwd: path.resolve(__dirname, ".."),
  shell: process.platform === "win32",
});

process.exit(result.status == null ? 1 : result.status);
