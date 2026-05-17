import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts, shadow } from "../theme";

const promptChips = [
  "Add two spicy chicken sandwiches",
  "Add a large water",
  "Make the fries large"
];

export function AssistantPanel({
  assistantBusy,
  input,
  messages,
  onChangeInput,
  onSend,
  onViewModeChange,
  viewMode
}) {
  const messagesScrollRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      messagesScrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length, viewMode]);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Assistant</Text>
          <Text style={styles.title}>Order by chat</Text>
        </View>
        {assistantBusy ? (
          <ActivityIndicator color={colors.coral} />
        ) : (
          <View style={styles.liveDot}>
            <View style={styles.liveDotCore} />
          </View>
        )}
      </View>

      <View style={styles.tabs}>
        {["compact", "json"].map((mode) => {
          const active = viewMode === mode;
          return (
            <Pressable key={mode} onPress={() => onViewModeChange(mode)} style={[styles.tab, active && styles.tabActive]}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{mode === "compact" ? "Compact" : "JSON"}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        ref={messagesScrollRef}
        onContentSizeChange={() => messagesScrollRef.current?.scrollToEnd({ animated: true })}
        style={styles.messages}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} viewMode={viewMode} />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {promptChips.map((chip) => (
          <Pressable key={chip} onPress={() => onSend(chip)} style={styles.promptChip}>
            <Text style={styles.promptText}>{chip}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          autoCorrect
          onChangeText={onChangeInput}
          onSubmitEditing={() => onSend()}
          placeholder="Add salmon bowls and yuzu spritzes"
          placeholderTextColor="#9A917F"
          returnKeyType="send"
          style={styles.input}
          value={input}
        />
        <Pressable accessibilityRole="button" onPress={() => onSend()} style={styles.sendButton}>
          <Ionicons color={colors.white} name="arrow-up" size={18} />
        </Pressable>
      </View>
    </View>
  );
}

function MessageBubble({ message, viewMode }) {
  const isUser = message.role === "user";
  const showActionData = !isUser && (message.actions?.length > 0 || message.receipt);
  const showJson = showActionData && viewMode === "json";

  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
      {!showJson ? <Text style={[styles.messageText, isUser && styles.userText]}>{message.text}</Text> : null}
      {showJson ? (
        <View style={styles.jsonBox}>
          <Text style={styles.jsonText}>{JSON.stringify(buildMessagePayload(message), null, 2)}</Text>
        </View>
      ) : null}
      {message.actions?.length > 0 && viewMode === "compact" ? (
        <View style={styles.actionSummary}>
          <View style={styles.actionIcon}>
            <Ionicons color={colors.white} name="checkmark" size={13} />
          </View>
          <Text style={styles.actionText}>{formatActionSummary(message.actions)}</Text>
        </View>
      ) : null}
      {message.receipt && viewMode === "compact" ? (
        <View style={styles.receipt}>
          <Text style={styles.receiptText}>Order {message.receipt.orderCode}</Text>
          <Text style={styles.receiptText}>{message.receipt.total}</Text>
        </View>
      ) : null}
    </View>
  );
}

function buildMessagePayload(message) {
  return {
    reply: message.text,
    actions: message.actions ?? [],
    source: message.source ?? "client",
    model: message.model ?? null,
    receipt: message.receipt ?? null
  };
}

function formatActionSummary(actions) {
  const count = actions.length;
  const types = new Set(actions.map((action) => action.type));

  if (types.has("clear_cart")) {
    return "Cart cleared";
  }

  if (types.has("update_item")) {
    return `${count} update${count === 1 ? "" : "s"} applied`;
  }

  if (types.has("remove_item")) {
    return `${count} cart change${count === 1 ? "" : "s"} applied`;
  }

  return `${count} item action${count === 1 ? "" : "s"} applied`;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderColor: "rgba(132,106,78,0.18)",
    borderRadius: 28,
    borderWidth: 1,
    marginHorizontal: 14,
    padding: 18,
    ...shadow
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
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
    fontSize: 29,
    fontWeight: "700",
    marginTop: 2
  },
  liveDot: {
    alignItems: "center",
    backgroundColor: colors.tealSoft,
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32
  },
  liveDotCore: {
    backgroundColor: colors.green,
    borderRadius: 5,
    height: 10,
    width: 10
  },
  tabs: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 17,
    flexDirection: "row",
    gap: 4,
    marginTop: 14,
    padding: 4
  },
  tab: {
    alignItems: "center",
    borderRadius: 13,
    flex: 1,
    justifyContent: "center",
    minHeight: 32
  },
  tabActive: {
    backgroundColor: colors.teal
  },
  tabText: {
    color: "#7B6C59",
    fontFamily: fonts.text,
    fontSize: 12,
    fontWeight: "900"
  },
  tabTextActive: {
    color: colors.white
  },
  messages: {
    marginTop: 12,
    maxHeight: 330
  },
  bubble: {
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: "92%",
    paddingHorizontal: 13,
    paddingVertical: 10
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceSoft
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.teal
  },
  messageText: {
    color: colors.ink,
    fontFamily: fonts.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  },
  userText: {
    color: colors.white
  },
  jsonBox: {
    backgroundColor: colors.teal,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 10
  },
  jsonText: {
    color: "#DFF8F3",
    fontFamily: fonts.mono,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 14
  },
  actionSummary: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.tealSoft,
    borderRadius: 15,
    flexDirection: "row",
    gap: 7,
    marginTop: 9,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  actionIcon: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: 8,
    height: 16,
    justifyContent: "center",
    width: 16
  },
  actionText: {
    color: "#1D7E74",
    fontFamily: fonts.text,
    fontSize: 12,
    fontWeight: "900"
  },
  receipt: {
    backgroundColor: "#FFFDF7",
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  receiptText: {
    color: colors.ink,
    fontFamily: fonts.text,
    fontSize: 12,
    fontWeight: "900"
  },
  chips: {
    gap: 8,
    paddingVertical: 8
  },
  promptChip: {
    backgroundColor: colors.coralSoft,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  promptText: {
    color: "#B84B37",
    fontFamily: fonts.text,
    fontSize: 12,
    fontWeight: "800"
  },
  inputRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 19,
    flexDirection: "row",
    gap: 8,
    padding: 6
  },
  input: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.text,
    fontSize: 15,
    fontWeight: "700",
    minHeight: 40,
    paddingHorizontal: 12
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: colors.coral,
    borderRadius: 15,
    height: 34,
    justifyContent: "center",
    width: 34
  }
});
