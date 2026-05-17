import { menu, menuById } from "./menu.js";

const quantityWords = new Map([
  ["a", 1],
  ["an", 1],
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
  ["ten", 10]
]);

const optionMatchers = {
  size: [
    ["large", "large"],
    ["big", "large"],
    ["regular", "regular"],
    ["small", "regular"]
  ],
  spice: [
    ["extra spicy", "extra spicy"],
    ["very spicy", "extra spicy"],
    ["hot", "extra spicy"],
    ["spicy", "spicy"],
    ["mild", "mild"],
    ["no chili", "no chili"],
    ["without chili", "no chili"],
    ["chili crisp", "chili crisp"]
  ],
  protein: [
    ["with chicken", "chicken"],
    ["chicken", "chicken"],
    ["with tofu", "tofu"],
    ["tofu", "tofu"],
    ["no protein", "none"],
    ["vegetarian", "none"],
    ["veggie", "none"]
  ],
  rice: [
    ["brown rice", "brown"],
    ["jasmine rice", "jasmine"],
    ["cauliflower rice", "cauliflower"]
  ],
  doneness: [
    ["medium well", "medium well"],
    ["well done", "well done"],
    ["medium", "medium"]
  ]
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

export function parseOrderIntent(message, cart = []) {
  const normalized = normalize(message);

  if (!normalized) {
    return buildResult("Tell me what you would like to change in your order.", [], cart);
  }

  if (/\b(clear|empty|start over|reset)\b/.test(normalized) && /\b(cart|order|bag)\b/.test(normalized)) {
    const actions = [{ type: "clear_cart" }];
    return buildResult("Cleared your cart.", actions, applyActions(cart, actions));
  }

  const clauses = splitClauses(normalized);
  const actions = [];

  for (const clause of clauses) {
    const intent = detectIntent(clause, normalized);
    const matches = findMenuMatches(clause);

    if (matches.length === 0) {
      continue;
    }

    for (const match of matches) {
      const item = match.item;
      const quantity = inferQuantity(clause, match.alias) ?? inferQuantity(normalized, match.alias) ?? 1;
      const options = inferOptions(`${clause} ${normalized}`, item);

      if (intent === "remove") {
        actions.push({
          type: "remove_item",
          itemId: item.id,
          quantity
        });
      } else if (intent === "update") {
        actions.push({
          type: "update_item",
          itemId: item.id,
          quantity,
          options
        });
      } else {
        actions.push({
          type: "add_item",
          itemId: item.id,
          quantity,
          options
        });
      }
    }
  }

  if (actions.length === 0) {
    const followUpAction = inferFollowUpAction(normalized, cart);
    if (followUpAction) {
      actions.push(followUpAction);
    }
  }

  if (actions.length === 0) {
    return buildResult(
      "I can help with that. Try something like, \"add two spicy chicken sandwiches\" or \"remove the fries.\"",
      [],
      cart
    );
  }

  const nextCart = applyActions(cart, actions);
  return buildResult(summarizeActions(actions, nextCart), actions, nextCart);
}

export function applyActions(cart, actions) {
  let nextCart = Array.isArray(cart) ? cart.map(normalizeCartItem).filter(Boolean) : [];

  for (const action of actions) {
    const item = menuById.get(action.itemId);

    if (action.type === "clear_cart") {
      nextCart = [];
      continue;
    }

    if (!item) {
      continue;
    }

    const quantity = clampQuantity(action.quantity ?? 1);
    const options = sanitizeOptions(item, action.options ?? {});
    const key = cartKey(item.id, options);
    const existingIndex = nextCart.findIndex((cartItem) => cartKey(cartItem.itemId, cartItem.options) === key);

    if (action.type === "remove_item") {
      if (existingIndex === -1) {
        nextCart = nextCart.filter((cartItem) => cartItem.itemId !== item.id);
      } else {
        const existing = nextCart[existingIndex];
        const nextQuantity = existing.quantity - quantity;
        if (nextQuantity > 0) {
          nextCart[existingIndex] = { ...existing, quantity: nextQuantity };
        } else {
          nextCart.splice(existingIndex, 1);
        }
      }
      continue;
    }

    if (action.type === "update_item") {
      const currentIndex =
        existingIndex !== -1 ? existingIndex : nextCart.findIndex((cartItem) => cartItem.itemId === item.id);

      if (currentIndex === -1) {
        nextCart.push(buildCartItem(item, quantity, options));
      } else {
        const current = nextCart[currentIndex];
        nextCart[currentIndex] = buildCartItem(item, quantity || current.quantity, {
          ...current.options,
          ...options
        });
      }
      continue;
    }

    if (existingIndex === -1) {
      nextCart.push(buildCartItem(item, quantity, options));
    } else {
      const existing = nextCart[existingIndex];
      nextCart[existingIndex] = { ...existing, quantity: existing.quantity + quantity };
    }
  }

  return nextCart;
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^\w\s.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitClauses(value) {
  return value
    .replace(/\b(add|get|order|i want|i would like|please|can i have|give me)\b/g, " ")
    .split(/\s+(?:and|plus|with)\s+|,\s*/)
    .map((clause) => clause.trim())
    .filter(Boolean);
}

function detectIntent(clause) {
  if (/\b(remove|delete|drop|take off|without|cancel)\b/.test(clause)) {
    return "remove";
  }

  if (/\b(change|make|set|update|switch|instead|only)\b/.test(clause)) {
    return "update";
  }

  return "add";
}

function findMenuMatches(clause) {
  const matches = [];

  for (const item of menu) {
    const aliases = [item.name.toLowerCase(), ...item.aliases].sort((a, b) => b.length - a.length);
    const alias = aliases.find((candidate) => containsPhrase(clause, candidate));

    if (alias) {
      matches.push({ item, alias, index: clause.indexOf(alias) });
    }
  }

  return matches
    .sort((a, b) => a.index - b.index)
    .filter((match, index, all) => all.findIndex((candidate) => candidate.item.id === match.item.id) === index);
}

function containsPhrase(value, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${escaped}(s|es)?($|\\s)`).test(value);
}

function inferQuantity(clause, alias) {
  const aliasIndex = clause.indexOf(alias);
  const beforeAlias = aliasIndex >= 0 ? clause.slice(0, aliasIndex).trim() : clause;
  const nearbyWords = beforeAlias.split(/\s+/).slice(-4);
  const digit = nearbyWords.findLast((word) => /^\d+$/.test(word));

  if (digit) {
    return clampQuantity(Number(digit));
  }

  const word = nearbyWords.findLast((candidate) => quantityWords.has(candidate));

  if (word) {
    return quantityWords.get(word);
  }

  return undefined;
}

function inferOptions(text, item) {
  const options = {};

  for (const [optionName, allowedValues] of Object.entries(item.optionGroups ?? {})) {
    const matchers = optionMatchers[optionName] ?? [];
    const matched = matchers.find(([phrase, value]) => allowedValues.includes(value) && containsLoose(text, phrase));

    if (matched) {
      options[optionName] = matched[1];
    }
  }

  return options;
}

function containsLoose(value, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${escaped}($|\\s)`).test(value);
}

function inferFollowUpAction(normalized, cart) {
  if (!Array.isArray(cart) || cart.length === 0) {
    return null;
  }

  const lastItem = cart.at(-1);
  const item = menuById.get(lastItem.itemId);

  if (!item) {
    return null;
  }

  const quantity = inferQuantity(normalized, "") ?? [...quantityWords].find(([word]) => containsLoose(normalized, word))?.[1];
  const options = inferOptions(normalized, item);

  if (quantity || Object.keys(options).length > 0) {
    return {
      type: "update_item",
      itemId: item.id,
      quantity: quantity ?? lastItem.quantity,
      options
    };
  }

  return null;
}

function sanitizeOptions(item, options) {
  const sanitized = {};

  for (const [key, value] of Object.entries(options)) {
    if (item.optionGroups?.[key]?.includes(value)) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function normalizeCartItem(cartItem) {
  const item = menuById.get(cartItem?.itemId);

  if (!item) {
    return null;
  }

  return buildCartItem(item, cartItem.quantity, cartItem.options);
}

function buildCartItem(item, quantity, options = {}) {
  return {
    itemId: item.id,
    name: item.name,
    price: item.price,
    quantity: clampQuantity(quantity),
    options: sanitizeOptions(item, options)
  };
}

function clampQuantity(value) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.max(1, Math.min(20, Math.round(quantity)));
}

function cartKey(itemId, options = {}) {
  const optionKey = Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");

  return `${itemId}:${optionKey}`;
}

function summarizeActions(actions, cart) {
  const addOrUpdate = actions.filter((action) => action.type === "add_item" || action.type === "update_item");
  const removals = actions.filter((action) => action.type === "remove_item");

  if (actions.some((action) => action.type === "clear_cart")) {
    return "Cleared your cart.";
  }

  const phrases = [];

  if (addOrUpdate.length > 0) {
    phrases.push(
      `${addOrUpdate.some((action) => action.type === "update_item") ? "Updated" : "Added"} ${formatActionList(addOrUpdate)}`
    );
  }

  if (removals.length > 0) {
    phrases.push(`Removed ${formatActionList(removals)}`);
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return `${phrases.join(" and ")}. Your cart total is ${currency.format(total)}.`;
}

function formatActionList(actions) {
  return actions
    .map((action) => {
      const item = menuById.get(action.itemId);
      const options = Object.values(action.options ?? {});
      const optionText = options.length > 0 ? ` (${options.join(", ")})` : "";
      return `${action.quantity ?? 1} ${item?.name ?? "item"}${optionText}`;
    })
    .join(" and ");
}

function buildResult(reply, actions, cart) {
  return {
    reply,
    actions,
    cart,
    suggestions: [
      "Add two spicy chicken sandwiches and a large water",
      "Make the fries large",
      "Remove one burger"
    ]
  };
}
