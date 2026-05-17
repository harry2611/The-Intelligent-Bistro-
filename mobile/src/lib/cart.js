export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

export function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function optionLabel(options = {}) {
  const values = Object.values(options).filter(Boolean);
  return values.length > 0 ? values.join(", ") : "Default";
}

export function cartKey(itemId, options = {}) {
  const optionKey = Object.entries(options)
    .filter(([, value]) => Boolean(value))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");

  return `${itemId}:${optionKey}`;
}

export function addToCart(cart, item, options = {}) {
  const key = cartKey(item.id, options);
  const existingIndex = cart.findIndex((cartItem) => cartKey(cartItem.itemId, cartItem.options) === key);

  if (existingIndex === -1) {
    return [
      ...cart,
      {
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        options
      }
    ];
  }

  return cart.map((cartItem, index) =>
    index === existingIndex ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
  );
}

export function changeQuantity(cart, itemId, delta, options = {}) {
  const key = cartKey(itemId, options);

  return cart
    .map((cartItem) =>
      cartKey(cartItem.itemId, cartItem.options) === key
        ? { ...cartItem, quantity: Math.max(0, cartItem.quantity + delta) }
        : cartItem
    )
    .filter((cartItem) => cartItem.quantity > 0);
}
