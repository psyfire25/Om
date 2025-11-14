import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
// scripts/make-admin-jwt.js
import crypto from "node:crypto";

// ---------------------------
// 1. Paste the user's UUID here
// ---------------------------
const USER_ID = "a79530da-4c41-4920-9044-9542fe391880";

// ---------------------------
// 2. Must match your .env
// ---------------------------
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  console.error("ERROR: JWT_SECRET missing from environment.");
  process.exit(1);
}

// JWT header
const header = {
  alg: "HS256",
  typ: "JWT"
};

// JWT payload
const payload = {
  sub: USER_ID,
  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30 days
};

// Base64URL helpers
const base64url = (input) =>
  Buffer.from(JSON.stringify(input))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const headerEncoded = base64url(header);
const payloadEncoded = base64url(payload);

// Signature (HMAC SHA256)
const data = `${headerEncoded}.${payloadEncoded}`;
const signature = crypto
  .createHmac("sha256", SECRET)
  .update(data)
  .digest("base64")
  .replace(/=/g, "")
  .replace(/\+/g, "-")
  .replace(/\//g, "_");

const token = `${data}.${signature}`;
console.log("\nYour JWT:\n");
console.log(token);
console.log("\nCopy and paste this into your browser cookie named 'session'.\n");