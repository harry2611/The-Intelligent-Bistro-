import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "../lib/cart";
import { colors, fonts, shadow } from "../theme";

export function MenuItemCard({ item, selectedOptions, onAdd, onChooseOption }) {
  const optionGroups = Object.entries(item.optionGroups ?? {});

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
        </View>

        {item.tags?.length > 0 ? (
          <View style={styles.tags}>
            {item.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {optionGroups.map(([groupName, values]) => (
          <View key={groupName} style={styles.optionGroup}>
            <Text style={styles.optionName}>{groupName}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionRow}>
              {values.map((value) => {
                const active = selectedOptions[groupName] === value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={value}
                    onPress={() => onChooseOption(groupName, active ? undefined : value)}
                    style={[styles.optionChip, active && styles.optionChipActive]}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{value}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ))}

        <Pressable accessibilityRole="button" onPress={onAdd} style={styles.addButton}>
          <Ionicons color={colors.white} name="add" size={18} />
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: "rgba(132,106,78,0.16)",
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 14,
    overflow: "hidden",
    ...shadow
  },
  image: {
    backgroundColor: "#E2D5BF",
    height: 172,
    width: "100%"
  },
  body: {
    padding: 16
  },
  header: {
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between"
  },
  titleGroup: {
    flex: 1
  },
  name: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 23,
    fontWeight: "700"
  },
  description: {
    color: colors.inkMuted,
    fontFamily: fonts.text,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 5
  },
  price: {
    color: colors.coral,
    fontFamily: fonts.text,
    fontSize: 16,
    fontWeight: "900"
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12
  },
  tag: {
    backgroundColor: colors.tealSoft,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  tagText: {
    color: "#1D7E74",
    fontFamily: fonts.text,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  optionGroup: {
    marginTop: 13
  },
  optionName: {
    color: "#8A7A64",
    fontFamily: fonts.text,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 7,
    textTransform: "uppercase"
  },
  optionRow: {
    gap: 7
  },
  optionChip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7
  },
  optionChipActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal
  },
  optionText: {
    color: "#746650",
    fontFamily: fonts.text,
    fontSize: 12,
    fontWeight: "800"
  },
  optionTextActive: {
    color: colors.white
  },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.coral,
    borderRadius: 17,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 12
  },
  addText: {
    color: colors.white,
    fontFamily: fonts.text,
    fontSize: 15,
    fontWeight: "900"
  }
});
