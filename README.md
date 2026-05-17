# The Intelligent Bistro Order Assistant

A high-fidelity Expo React Native app with a Node.js backend for conversational restaurant ordering.

## What It Does

- Browse a polished mobile menu experience.
- Add, remove, and edit cart items directly in the UI.
- Chat with an AI-style ordering assistant.
- Convert natural language such as `Add two spicy chicken sandwiches and a large water` into structured JSON cart actions.
- Return a server-applied cart so the app and backend stay in sync.

## Run Locally

Install dependencies:

```sh
npm install
```

Start the backend:

```sh
npm run dev:server
```

To use a real model for conversational parsing, set an API key before starting the backend.

OpenAI:

```sh
OPENAI_API_KEY=sk-your-key npm run dev:server
```

Anthropic:

```sh
ANTHROPIC_API_KEY=sk-ant-your-key npm run dev:server
```

If both keys are present, OpenAI is used by default. To force Claude:

```sh
AI_PROVIDER=anthropic ANTHROPIC_API_KEY=sk-ant-your-key npm run dev:server
```

Without a provider key, the backend automatically falls back to the local deterministic parser so demos still work offline.

Start the Expo app in another terminal:

```sh
npm run dev:mobile
```

The backend defaults to `http://localhost:4000`. If you run the Expo app on a physical phone, set `EXPO_PUBLIC_API_URL` to your computer's LAN URL:

```sh
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:4000 npm run dev:mobile
```

## API

`GET /menu`

Returns the restaurant menu.

`POST /ai/order`

Request:

```json
{
  "message": "Add two spicy chicken sandwiches and a large water",
  "cart": []
}
```

Response:

```json
{
  "reply": "Added 2 Spicy Chicken Sandwiches and 1 Still Water.",
  "actions": [
    {
      "type": "add_item",
      "itemId": "spicy-chicken-sandwich",
      "quantity": 2,
      "options": {
        "spice": "spicy"
      }
    },
    {
      "type": "add_item",
      "itemId": "still-water",
      "quantity": 1,
      "options": {
        "size": "large"
      }
    }
  ],
  "cart": [
    {
      "itemId": "spicy-chicken-sandwich",
      "name": "Spicy Chicken Sandwich",
      "price": 12.5,
      "quantity": 2,
      "options": {
        "spice": "spicy"
      }
    },
    {
      "itemId": "still-water",
      "name": "Still Water",
      "price": 2.75,
      "quantity": 1,
      "options": {
        "size": "large"
      }
    }
  ]
}
```
