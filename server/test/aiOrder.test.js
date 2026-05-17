import test from "node:test";
import assert from "node:assert/strict";
import { getAiProvider, processOrderIntent } from "../src/aiOrder.js";

test("falls back to the local parser when OPENAI_API_KEY is not configured", async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const result = await processOrderIntent("Add two spicy chicken sandwiches and a large water", []);

    assert.equal(result.source, "local-parser");
    assert.equal(result.actions.length, 2);
    assert.equal(result.cart.length, 2);
  } finally {
    if (originalKey) {
      process.env.OPENAI_API_KEY = originalKey;
    }
  }
});

test("selects Anthropic when only ANTHROPIC_API_KEY is configured", () => {
  const originalOpenAiKey = process.env.OPENAI_API_KEY;
  const originalAnthropicKey = process.env.ANTHROPIC_API_KEY;
  const originalProvider = process.env.AI_PROVIDER;

  delete process.env.OPENAI_API_KEY;
  process.env.ANTHROPIC_API_KEY = "test-key";
  delete process.env.AI_PROVIDER;

  try {
    assert.equal(getAiProvider(), "anthropic");
  } finally {
    restoreEnv("OPENAI_API_KEY", originalOpenAiKey);
    restoreEnv("ANTHROPIC_API_KEY", originalAnthropicKey);
    restoreEnv("AI_PROVIDER", originalProvider);
  }
});

test("can force Anthropic when both provider keys exist", () => {
  const originalOpenAiKey = process.env.OPENAI_API_KEY;
  const originalAnthropicKey = process.env.ANTHROPIC_API_KEY;
  const originalProvider = process.env.AI_PROVIDER;

  process.env.OPENAI_API_KEY = "test-openai-key";
  process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
  process.env.AI_PROVIDER = "anthropic";

  try {
    assert.equal(getAiProvider(), "anthropic");
  } finally {
    restoreEnv("OPENAI_API_KEY", originalOpenAiKey);
    restoreEnv("ANTHROPIC_API_KEY", originalAnthropicKey);
    restoreEnv("AI_PROVIDER", originalProvider);
  }
});

function restoreEnv(key, value) {
  if (value) {
    process.env[key] = value;
  } else {
    delete process.env[key];
  }
}
