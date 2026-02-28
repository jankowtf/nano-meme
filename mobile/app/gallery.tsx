import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GalleryHorizontalEnd, Heart, Trash2 } from "lucide-react-native";
import { useMemeStore, type MemeHistoryItem } from "../src/stores/memeStore";
import { colors } from "../src/utils/colors";

function MemeCard({ item }: { item: MemeHistoryItem }) {
  const { toggleFavorite, deleteFromHistory } = useMemeStore();

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.imageUri }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardOverlay} numberOfLines={1}>
          {item.overlayText || "No overlay"}
        </Text>
        <Text style={styles.cardDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <Pressable onPress={() => toggleFavorite(item.id)} hitSlop={8}>
          <Heart
            color={colors.brand.magenta}
            size={18}
            fill={item.isFavorite ? colors.brand.magenta : "none"}
          />
        </Pressable>
        <Pressable onPress={() => deleteFromHistory(item.id)} hitSlop={8}>
          <Trash2 color={colors.text.muted} size={18} />
        </Pressable>
      </View>
    </View>
  );
}

export default function GalleryScreen() {
  const { history } = useMemeStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <GalleryHorizontalEnd color={colors.brand.cyan} size={24} />
        <Text style={styles.title}>Gallery</Text>
        <Text style={styles.count}>{history.length} memes</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No memes generated yet. Start creating!
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MemeCard item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    flex: 1,
  },
  count: {
    fontSize: 14,
    color: colors.text.muted,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface.card,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.1)",
  },
  thumbnail: {
    width: 80,
    height: 80,
    backgroundColor: colors.surface.secondary,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  cardOverlay: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: colors.text.muted,
  },
  cardActions: {
    padding: 12,
    justifyContent: "center",
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.muted,
    textAlign: "center",
  },
});
