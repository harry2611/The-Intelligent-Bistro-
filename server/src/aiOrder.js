import { applyActions, parseOrderIntent } from "./parser.js";
import { menu, menuById } from "./menu.js";

const openAiUrl = "https://api.openai.com/v1/responses";
const anthropicUrl = "https://api.anthropic.com/v1/messages";
const openAiModel = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const anthropicModel = process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest";

const actionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "actions"],
  properties: {
    reply: {
      type: "string",
      description: "A concise guest-facing sentence describing what changed."
    },
    actions: {
      type: "array",
      description: "Cart actions inferred from the guest message.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "itemId", "quantity", "options"],
        properties: {
          type: {
            type: "string",
            enum: ["add_item", "remove_item", "update_item", "clear_cart"]
          },
          itemId: {
            type: "string",
            enum: ["__none__", ...menu.map((item) => item.id)]
          },
          quantity: {
            type: "integer",
            description: "Use 1 unless the guest clearly provides a different quantity."
          },
          options: {
            type: "object",
            additionalProperties: false,
            required: ["size", "spice", "protein", "rice", "doneness"],
            properties: {
              size: { type: "string", enum: ["", "regular", "large"] },
              spice: { type: "string", enum: ["", "mild", "spicy", "extra spicy", "no chili", "chili crisp"] },
              protein: { type: "string", enum: ["", "none", "chicken", "tofu"] },
              rice: { type: "string", enum: ["", "jasmine", "brown", "cauliflower"] },
              doneness: { type: "string", enum: ["", "medium", "medium well", "well done"] }
            }
          }
        }
      }
    }
  }
};

export async function processOrderIntent(message, cart = []) {
  const provider = getAiProvider();

  if (provider === "local-parser") {
    return {
      ...parseOrderIntent(message, cart),
      source: "local-parser"
    };
  }

  try {
    const aiResult = provider === "anthropic" ? await parseWithAnthropic(message, cart) : await parseWithOpenAi(message, cart);
    const actions = normalizeActions(aiResult.actions);
    const nextCart = applyActions(cart, actions);

    return {
      reply: aiResult.reply || summarizeAiActions(actions, nextCart),
      actions,
      cart: nextCart,
      source: provider,
      model: provider === "anthropic" ? anthropicModel : openAiModel,
      suggestions: [
        "Add two spicy chicken sandwiches and a large water",
        "Make the fries large",
        "Remove one burger"
      ]
    };
  } catch (error) {
    console.warn(`${provider} order parser failed; falling back to local parser.`, error);
    return {
      ...parseOrderIntent(message, cart),
      source: "local-parser-fallback"
    };
  }
}

export function getAiProvider() {
  const requestedProvider = process.env.AI_PROVIDER?.toLowerCase();

  if (requestedProvider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return "anthropic";
  }

  if (requestedProvider === "openai" && process.env.OPENAI_API_KEY) {
    return "openai";
  }

  if (process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    return "anthropic";
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  return "local-parser";
}

async function parseWithOpenAi(message, cart) {
  const response = await fetch(openAiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: openAiModel,
      input: [
        {
          role: "system",
          content: [
            "You are the ordering intelligence for The Intelligent Bistro.",
            "Convert guest language into JSON cart actions only.",
            "Use only menu item IDs and option values from the provided menu.",
            "Do not ignore separate requests joined by words like 'and', 'plus', or 'also'.",
            "When a guest describes a menu item by flavor or style instead of exact name, choose the closest menu match.",
            "For example, a sparkling citrus drink should map to yuzu-spritz.",
            "If the request is ambiguous or unrelated, return no actions and a helpful reply.",
            "For clear_cart, use itemId '__none__', quantity 1, and empty option strings."
          ].join(" ")
        },
        {
          role: "user",
          content: JSON.stringify({
            guestMessage: message,
            currentCart: cart,
            menu: menu.map((item) => ({
              id: item.id,
              name: item.name,
              category: item.category,
              description: item.description,
              tags: item.tags,
              aliases: item.aliases,
              optionGroups: item.optionGroups
            }))
          })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "restaurant_order_actions",
          strict: true,
          schema: actionSchema
        }
      }
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "OpenAI request failed");
  }

  const text = extractOutputText(payload);

  if (!text) {
    throw new Error("OpenAI response did not include output text");
  }

  return JSON.parse(text);
}

async function parseWithAnthropic(message, cart) {
  const response = await fetch(anthropicUrl, {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: anthropicModel,
      max_tokens: 1024,
      system: [
        "You are the ordering intelligence for The Intelligent Bistro.",
        "Convert guest language into structured cart actions.",
        "Use only menu item IDs and option values from the provided menu.",
        "Do not ignore separate requests joined by words like 'and', 'plus', or 'also'.",
        "When a guest describes a menu item by flavor or style instead of exact name, choose the closest menu match.",
        "For example, a sparkling citrus drink should map to yuzu-spritz.",
        "If the request is ambiguous or unrelated, return no actions and a helpful reply.",
        "For clear_cart, use itemId '__none__', quantity 1, and empty option strings."
      ].join(" "),
      tools: [
        {
          name: "restaurant_order_actions",
          description: "Return the structured cart actions inferred from the guest message.",
          input_schema: actionSchema
        }
      ],
      tool_choice: {
        type: "tool",
        name: "restaurant_order_actions"
      },
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            guestMessage: message,
            currentCart: cart,
            menu: menu.map((item) => ({
              id: item.id,
              name: item.name,
              category: item.category,
              description: item.description,
              tags: item.tags,
              aliases: item.aliases,
              optionGroups: item.optionGroups
            }))
          })
        }
      ]
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Anthropic request failed");
  }

  const toolUse = payload.content?.find((content) => content.type === "tool_use" && content.name === "restaurant_order_actions");

  if (!toolUse?.input) {
    throw new Error("Anthropic response did not include the expected tool input");
  }

  return toolUse.input;
}

function extractOutputText(payload) {
  if (payload.output_text) {
    return payload.output_text;
  }

  for (const output of payload.output ?? []) {
    for (const content of output.content ?? []) {
      if (content.type === "output_text" && content.text) {
        return content.text;
      }
    }
  }

  return "";
}

function normalizeActions(actions = []) {
  return actions
    .map((action) => {
      if (action.type === "clear_cart") {
        return { type: "clear_cart" };
      }

      if (!menuById.has(action.itemId)) {
        return null;
      }

      return {
        type: action.type,
        itemId: action.itemId,
        quantity: clampQuantity(action.quantity),
        options: compactOptions(action.options)
      };
    })
    .filter(Boolean);
}

function compactOptions(options = {}) {
  return Object.fromEntries(Object.entries(options).filter(([, value]) => Boolean(value)));
}

function clampQuantity(value) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.max(1, Math.min(20, Math.round(quantity)));
}

function summarizeAiActions(actions, cart) {
  if (actions.length === 0) {
    return "I can help with menu changes, additions, removals, and checkout questions.";
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return `Updated your cart. Your cart total is ${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(total)}.`;
}
