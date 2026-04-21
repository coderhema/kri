#!/usr/bin/env node
import { runInit } from "../index.js";

const args = process.argv.slice(2);
const [command] = args;

if (command === "init") {
  await runInit({ cwd: process.cwd(), args });
} else {
  console.log("kri: unknown command");
  console.log("Usage: kri init");
  process.exit(1);
}
