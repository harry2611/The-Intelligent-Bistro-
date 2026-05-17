import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { cartCount, formatCurrency } from "../lib/cart";
import { colors, fonts } from "../theme";

export function AppHeader({ cart, total, onCartPress }) {
  return (
    <LinearGradient colors={["#26372F", "#846A4E", "#D9A66B"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.brandMark}>
          <MaterialCommunityIcons color={colors.white} name="silverware-fork-knife" size={22} />
        </View>
        <Pressable accessibilityRole="button" onPress={onCartPress} style={styles.cartButton}>
          <Ionicons color={colors.teal} name="bag-outline" size={18} />
          <Text style={styles.cartButtonText}>{cartCount(cart)}</Text>
        </Pressable>
      </View>

      <View style={styles.headerCopy}>
        <Text style={styles.kicker}>The Intelligent Bistro</Text>
        <Text style={styles.title}>Dinner, orchestrated by conversation.</Text>
        <Text style={styles.subtitle}>A polished table service for ordering, revising, and checking out.</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Ionicons color={colors.cream} name="time-outline" size={14} />
            <Text style={styles.metaText}>18-24 min</Text>
          </View>
          <View style={styles.metaPill}>
            <Ionicons color={colors.cream} name="sparkles-outline" size={14} />
            <Text style={styles.metaText}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    minHeight: 318,
    paddingBottom: 30,
    paddingHorizontal: 22,
    paddingTop: 18
  },
  headerTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: "rgba(255,248,234,0.2)",
    borderColor: "rgba(255,248,234,0.36)",
    borderRadius: 22,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  cartButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 22,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11
  },
  cartButtonText: {
    color: colors.teal,
    fontFamily: fonts.text,
    fontSize: 14,
    fontWeight: "800"
  },
  headerCopy: {
    marginTop: 42
  },
  kicker: {
    color: "#FFF0C9",
    fontFamily: fonts.text,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  title: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 43,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 47,
    marginTop: 9,
    maxWidth: 350,
    textShadowColor: "rgba(0,0,0,0.18)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10
  },
  subtitle: {
    color: colors.cream,
    fontFamily: fonts.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 12,
    maxWidth: 318,
    opacity: 0.9
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22
  },
  metaPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,248,234,0.17)",
    borderColor: "rgba(255,248,234,0.28)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  metaText: {
    color: colors.cream,
    fontFamily: fonts.text,
    fontSize: 13,
    fontWeight: "700"
  }
});
