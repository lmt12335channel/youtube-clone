import { Client } from "@upstash/workflow";

if (!process.env.QSTASH_TOKEN) {
  throw new Error("QSTASH_TOKEN is not set in environment variables.");
}

export const workflow = new Client({
  token: process.env.QSTASH_TOKEN,
});