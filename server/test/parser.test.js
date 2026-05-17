import test from "node:test";
import assert from "node:assert/strict";
import { parseOrderIntent } from "../src/parser.js";

test("parses a compound add request into structured actions", () => {
  const result = parseOrderIntent("Add two spicy chicken sandwiches and a large water", []);

  assert.deepEqual(result.actions, [
    {
      type: "add_item",
      itemId: "spicy-chicken-sandwich",
      quantity: 2,
      options: {
        spice: "spicy"
      }
    },
    {
      type: "add_item",
      itemId: "still-water",
      quantity: 1,
      options: {
        size: "large"
      }
    }
  ]);
  assert.equal(result.cart.length, 2);
  assert.equal(result.cart[0].quantity, 2);
});

test("updates quantity and options for existing cart items", () => {
  const cart = parseOrderIntent("add fries", []).cart;
  const result = parseOrderIntent("make the fries large", cart);

  assert.deepEqual(result.actions, [
    {
      type: "update_item",
      itemId: "parmesan-fries",
      quantity: 1,
      options: {
        size: "large"
      }
    }
  ]);
  assert.equal(result.cart[0].options.size, "large");
});

test("removes requested quantities", () => {
  const cart = parseOrderIntent("add three burgers", []).cart;
  const result = parseOrderIntent("remove one burger", cart);

  assert.equal(result.cart[0].quantity, 2);
  assert.equal(result.actions[0].type, "remove_item");
});

test("handles separate fuzzy bowl and drink requests", () => {
  const result = parseOrderIntent("Can you make my bowl vegetarian and add a sparkling citrus drink?", []);

  assert.deepEqual(
    result.actions.map((action) => ({
      type: action.type,
      itemId: action.itemId,
      options: action.options
    })),
    [
      {
        type: "update_item",
        itemId: "market-grain-bowl",
        options: {
          protein: "none"
        }
      },
      {
        type: "add_item",
        itemId: "yuzu-spritz",
        options: {}
      }
    ]
  );
});
