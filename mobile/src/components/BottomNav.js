import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { cartCount } from "../lib/cart";
import { colors, fonts, shadow } from "../theme";

const tabs = [
  { key: "menu", label: "Menu", icon: "restaurant-outline" },
  { key: "assistant", label: "AI", icon: "sparkles-outline" },
  { key: "cart", label: "Cart", icon: "bag-outline" }
];

export function BottomNav({ activeTab, cart, onChangeTab }) {
  const count = cartCount(cart);

  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;

        return (
          <Pressable
            accessibilityRole="button"
            key={tab.key}
            onPress={() => onChangeTab(tab.key)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Ionicons color={active ? colors.white : "#8A7A64"} name={tab.icon} size={18} />
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            {tab.key === "cart" && count > 0 ? <Text style={styles.badge}>{count}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: "rgba(132,106,78,0.18)",
    borderRadius: 25,
    borderWidth: 1,
    bottom: 18,
    flexDirection: "row",
    gap: 6,
    left: 16,
    padding: 7,
    position: "absolute",
    right: 16,
    ...shadow
  },
  tab: {
    alignItems: "center",
    borderRadius: 19,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 44
  },
  tabActive: {
    backgroundColor: colors.teal
  },
  label: {
    color: "#8A7A64",
    fontFamily: fonts.text,
    fontSize: 13,
    fontWeight: "900"
  },
  labelActive: {
    color: colors.white
  },
  badge: {
    backgroundColor: colors.coral,
    borderRadius: 9,
    color: colors.white,
    fontFamily: fonts.text,
    fontSize: 10,
    fontWeight: "900",
    minWidth: 18,
    overflow: "hidden",
    paddingHorizontal: 5,
    paddingVertical: 2,
    textAlign: "center"
  }
});
