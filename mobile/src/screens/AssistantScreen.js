import { useEffect, useRef } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AssistantPanel } from "../components/AssistantPanel";
import { colors, fonts } from "../theme";

const demoPrompts = [
  {
    label: "Compound add",
    text: "Add two spicy chicken sandwiches and a large water"
  },
  {
    label: "Fuzzy match",
    text: "Can you make my bowl vegetarian and add a sparkling citrus drink?"
  },
  {
    label: "Cart edit",
    text: "Make the fries large and remove one burger"
  },
  {
    label: "Group order",
    text: "I am ordering for two people. Give us both the spicy chicken and add something refreshing to drink."
  }
];

export function AssistantScreen({
  assistantBusy,
  input,
  messages,
  onChangeInput,
  onSend,
  onViewModeChange,
  viewMode
}) {
  const pageScrollRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      pageScrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length]);

  return (
    <KeyboardAvoidingView style={styles.wrap} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView ref={pageScrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>AI Concierge</Text>
          <Text style={styles.title}>Ask for the order you actually mean.</Text>
          <Text style={styles.subtitle}>The assistant converts natural language into cart actions and keeps a JSON audit trail.</Text>
        </View>
        <View style={styles.examples}>
          <View style={styles.examplesHeader}>
            <Text style={styles.examplesTitle}>Demo prompts</Text>
            <Text style={styles.examplesHint}>Tap one</Text>
          </View>
          {demoPrompts.map((prompt) => (
            <Pressable accessibilityRole="button" key={prompt.text} onPress={() => onSend(prompt.text)} style={styles.exampleCard}>
              <Text style={styles.exampleLabel}>{prompt.label}</Text>
              <Text style={styles.exampleText}>{prompt.text}</Text>
            </Pressable>
          ))}
        </View>
        <AssistantPanel
          assistantBusy={assistantBusy}
          input={input}
          messages={messages}
          onChangeInput={onChangeInput}
          onSend={onSend}
          onViewModeChange={onViewModeChange}
          viewMode={viewMode}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1
  },
  content: {
    paddingBottom: 110,
    paddingTop: 18
  },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 18
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
    fontSize: 40,
    fontWeight: "700",
    lineHeight: 43,
    marginTop: 6
  },
  subtitle: {
    color: colors.inkMuted,
    fontFamily: fonts.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 10
  },
  examples: {
    gap: 9,
    marginBottom: 16,
    paddingHorizontal: 14
  },
  examplesHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6
  },
  examplesTitle: {
    color: colors.ink,
    fontFamily: fonts.text,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  examplesHint: {
    color: "#8A7A64",
    fontFamily: fonts.text,
    fontSize: 12,
    fontWeight: "800"
  },
  exampleCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  exampleLabel: {
    color: colors.coral,
    fontFamily: fonts.text,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  exampleText: {
    color: colors.ink,
    fontFamily: fonts.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19,
    marginTop: 4
  }
});
