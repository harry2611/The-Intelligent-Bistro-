import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomNav } from "./src/components/BottomNav";
import { fetchMenu, sendOrderMessage } from "./src/lib/api";
import { addToCart, cartCount, cartTotal, changeQuantity } from "./src/lib/cart";
import { AssistantScreen } from "./src/screens/AssistantScreen";
import { CartScreen } from "./src/screens/CartScreen";
import { MenuScreen } from "./src/screens/MenuScreen";
import { colors } from "./src/theme";

const starterMessages = [
  {
    id: "assistant-open",
    role: "assistant",
    text: "Good evening. I have your cart open and can make changes as you order."
  }
];

export default function App() {
  return (
    <SafeAreaProvider>
      <OrderApp />
    </SafeAreaProvider>
  );
}

function OrderApp() {
  const [activeTab, setActiveTab] = useState("menu");
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [assistantViewMode, setAssistantViewMode] = useState("compact");
  const [cart, setCart] = useState([]);
  const [input, setInput] = useState("");
  const [menu, setMenu] = useState([]);
  const [messages, setMessages] = useState(starterMessages);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    fetchMenu().then(setMenu);
  }, []);

  const categories = useMemo(() => ["All", ...new Set(menu.map((item) => item.category))], [menu]);
  const filteredMenu = selectedCategory === "All" ? menu : menu.filter((item) => item.category === selectedCategory);
  const total = cartTotal(cart);

  function chooseOption(itemId, groupName, value) {
    setSelectedOptions((current) => ({
      ...current,
      [itemId]: compactOptions({
        ...(current[itemId] ?? {}),
        [groupName]: value
      })
    }));
  }

  function handleAddItem(item) {
    const options = selectedOptions[item.id] ?? {};
    setCart((current) => addToCart(current, item, options));
  }

  function handleCartQuantity(item, delta) {
    setCart((current) => changeQuantity(current, item.itemId, delta, item.options));
  }

  function handlePlaceOrder() {
    if (cart.length === 0) {
      return;
    }

    const orderCode = `VK-${String(Date.now()).slice(-5)}`;
    const totalText = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(total);
    const count = cartCount(cart);

    setCart([]);
    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-order-confirmed`,
        role: "assistant",
        text: `Order ${orderCode} is confirmed. ${count} item${count === 1 ? "" : "s"} will be ready in 18-24 minutes. Total paid: ${totalText}.`,
        receipt: {
          orderCode,
          total: totalText,
          count
        }
      }
    ]);
    setActiveTab("assistant");
  }

  async function handleSend(message = input) {
    const trimmed = message.trim();

    if (!trimmed || assistantBusy) {
      return;
    }

    setInput("");
    setAssistantBusy(true);
    setMessages((current) => [...current, { id: `${Date.now()}-user`, role: "user", text: trimmed }]);

    try {
      const result = await sendOrderMessage(trimmed, cart);
      setCart(result.cart);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: result.reply,
          actions: result.actions,
          model: result.model,
          source: result.source
        }
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant-error`,
          role: "assistant",
          text: "I could not reach the kitchen system. The menu still works from this device.",
          source: "network-error",
          actions: [],
          model: error instanceof Error ? error.message : "Unknown network error"
        }
      ]);
    } finally {
      setAssistantBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      {activeTab === "menu" ? (
        <MenuScreen
          cart={cart}
          categories={categories}
          filteredMenu={filteredMenu}
          onAddItem={handleAddItem}
          onCartPress={() => setActiveTab("cart")}
          onChooseOption={chooseOption}
          onSelectCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
          selectedOptions={selectedOptions}
          total={total}
        />
      ) : null}

      {activeTab === "assistant" ? (
        <AssistantScreen
          assistantBusy={assistantBusy}
          input={input}
          messages={messages}
          onChangeInput={setInput}
          onSend={handleSend}
          onViewModeChange={setAssistantViewMode}
          viewMode={assistantViewMode}
        />
      ) : null}

      {activeTab === "cart" ? (
        <CartScreen cart={cart} onPlaceOrder={handlePlaceOrder} onQuantity={handleCartQuantity} />
      ) : null}

      <BottomNav activeTab={activeTab} cart={cart} onChangeTab={setActiveTab} />
    </SafeAreaView>
  );
}

function compactOptions(options) {
  return Object.fromEntries(Object.entries(options).filter(([, value]) => Boolean(value)));
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1
  }
});
