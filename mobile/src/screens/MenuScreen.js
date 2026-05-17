import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { MenuItemCard } from "../components/MenuItemCard";
import { colors, fonts } from "../theme";

export function MenuScreen({
  cart,
  categories,
  filteredMenu,
  onAddItem,
  onCartPress,
  onChooseOption,
  onSelectCategory,
  selectedCategory,
  selectedOptions,
  total
}) {
  return (
    <FlatList
      data={filteredMenu}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <AppHeader cart={cart} total={total} onCartPress={onCartPress} />
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Menu</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRail}>
              {categories.map((category) => {
                const active = category === selectedCategory;
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={category}
                    onPress={() => onSelectCategory(category)}
                    style={[styles.categoryPill, active && styles.categoryPillActive]}
                  >
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{category}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      }
      ListFooterComponent={<View style={styles.footer} />}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <MenuItemCard
          item={item}
          onAdd={() => onAddItem(item)}
          onChooseOption={(groupName, value) => onChooseOption(item.id, groupName, value)}
          selectedOptions={selectedOptions[item.id] ?? {}}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 104
  },
  categorySection: {
    paddingHorizontal: 16,
    paddingTop: 26
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: "700"
  },
  categoryRail: {
    gap: 8,
    paddingVertical: 14
  },
  categoryPill: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 9
  },
  categoryPillActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal
  },
  categoryText: {
    color: "#746650",
    fontFamily: fonts.text,
    fontSize: 13,
    fontWeight: "800"
  },
  categoryTextActive: {
    color: colors.white
  },
  footer: {
    height: 18
  }
});
