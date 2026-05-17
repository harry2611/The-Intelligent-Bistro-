import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { cartCount, cartTotal, formatCurrency, optionLabel } from "../lib/cart";
import { colors, fonts, shadow } from "../theme";

export function CartScreen({ cart, onPlaceOrder, onQuantity }) {
  const total = cartTotal(cart);
  const count = cartCount(cart);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Cart</Text>
        <Text style={styles.title}>{formatCurrency(total)}</Text>
        <Text style={styles.subtitle}>{count} item{count === 1 ? "" : "s"} ready for checkout</Text>
      </View>

      {cart.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons color="#9A917F" name="bag-outline" size={42} />
          <Text style={styles.emptyTitle}>Your cart is empty.</Text>
          <Text style={styles.emptyText}>Add a dish from the menu or ask the assistant to build your order.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.lines} showsVerticalScrollIndicator={false}>
          {cart.map((item) => (
            <View key={`${item.itemId}-${optionLabel(item.options)}`} style={styles.line}>
              <View style={styles.lineCopy}>
                <Text style={styles.lineName}>{item.name}</Text>
                <Text style={styles.lineOptions}>{optionLabel(item.options)}</Text>
                <Text style={styles.linePrice}>{formatCurrency(item.price * item.quantity)}</Text>
              </View>
              <View style={styles.quantityControl}>
                <Pressable accessibilityRole="button" onPress={() => onQuantity(item, -1)} style={styles.quantityButton}>
                  <Ionicons color={colors.ink} name="remove" size={16} />
                </Pressable>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <Pressable accessibilityRole="button" onPress={() => onQuantity(item, 1)} style={styles.quantityButton}>
                  <Ionicons color={colors.ink} name="add" size={16} />
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Pressable
        accessibilityRole="button"
        disabled={cart.length === 0}
        onPress={onPlaceOrder}
        style={[styles.placeOrderButton, cart.length === 0 && styles.disabledButton]}
      >
        <Text style={styles.placeOrderText}>Place order</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingBottom: 104,
    paddingHorizontal: 16,
    paddingTop: 20
  },
  header: {
    marginBottom: 18
  },
  eyebrow: {
    color: colors.coral,
    fontFamily: fonts.text,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 48,
    fontWeight: "700",
    marginTop: 4
  },
  subtitle: {
    color: colors.inkMuted,
    fontFamily: fonts.text,
    fontSize: 14,
    fontWeight: "800"
  },
  empty: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 26,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 280,
    padding: 24,
    ...shadow
  },
  emptyTitle: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: "700",
    marginTop: 12
  },
  emptyText: {
    color: colors.inkMuted,
    fontFamily: fonts.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center"
  },
  lines: {
    gap: 12,
    paddingBottom: 18
  },
  line: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    ...shadow
  },
  lineCopy: {
    flex: 1,
    paddingRight: 14
  },
  lineName: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: "700"
  },
  lineOptions: {
    color: "#8A7A64",
    fontFamily: fonts.text,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
    textTransform: "capitalize"
  },
  linePrice: {
    color: colors.coral,
    fontFamily: fonts.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 6
  },
  quantityControl: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 17,
    flexDirection: "row",
    gap: 10,
    padding: 5
  },
  quantityButton: {
    alignItems: "center",
    backgroundColor: "#FFFDF7",
    borderRadius: 12,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  quantityText: {
    color: colors.ink,
    fontFamily: fonts.text,
    fontSize: 14,
    fontWeight: "900",
    minWidth: 18,
    textAlign: "center"
  },
  placeOrderButton: {
    alignItems: "center",
    backgroundColor: colors.teal,
    borderRadius: 22,
    marginTop: 12,
    paddingVertical: 16
  },
  disabledButton: {
    opacity: 0.45
  },
  placeOrderText: {
    color: colors.white,
    fontFamily: fonts.text,
    fontSize: 15,
    fontWeight: "900"
  }
});
