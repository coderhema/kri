#!/usr/bin/env node
import { runInit } from "../index.js";

const args = process.argv.slice(2);
const [command] = args;

if (command === "init") {
  try {
    await runInit({ cwd: process.cwd(), args });
  } catch (err) {
    console.error("kri: init failed");
    console.error(err?.message || err);
    process.exitCode = 1;
  }
} else {
  console.log("kri: unknown command");
  console.log("Usage: kri init");
  process.exit(1);
}
