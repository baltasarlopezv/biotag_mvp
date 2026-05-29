import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  authBg: { flex: 1 },
  authWrap: { flex: 1, justifyContent: "center", padding: 24 },
  logo: { alignSelf: "center", height: 92, marginBottom: 10, width: 92 },
  authTitle: { color: "#123c2f", fontSize: 38, fontWeight: "800", textAlign: "center" },
  authSubtitle: {
    alignSelf: "center",
    color: "#60736c",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 340,
    textAlign: "center"
  },
  authCard: {
    backgroundColor: "#fff",
    borderColor: "#e2ece7",
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    padding: 18,
    shadowColor: "#224437",
    shadowOpacity: 0.08,
    shadowRadius: 18
  },
  authHint: { color: "#60736c", fontSize: 14, fontWeight: "700", lineHeight: 20 },
  authLink: { alignItems: "center", paddingVertical: 10 },
  authLinkText: { color: "#0b6b4f", fontSize: 14, fontWeight: "800" },
  configErrorTitle: { color: "#123c2f", fontSize: 18, fontWeight: "900", textAlign: "center" },
  configErrorText: { color: "#60736c", fontSize: 14, lineHeight: 20, textAlign: "center" },
  segment: { backgroundColor: "#eef6f1", borderRadius: 16, flexDirection: "row", padding: 4 },
  segmentItem: { alignItems: "center", borderRadius: 12, flex: 1, paddingVertical: 11 },
  segmentActive: { backgroundColor: "#fff" },
  segmentText: { color: "#7b8d86", fontWeight: "700" },
  segmentTextActive: { color: "#0b6b4f", fontWeight: "800" },
  row: { flexDirection: "row", gap: 10 },
  rowInput: { flex: 1 },
  input: {
    backgroundColor: "#f8faf8",
    borderColor: "#dce9e3",
    borderRadius: 14,
    borderWidth: 1,
    color: "#173b2f",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13
  },
  button: {
    alignItems: "center",
    backgroundColor: "#0b6b4f",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 18
  },
  buttonSecondary: {
    backgroundColor: "#eef8f3",
    borderColor: "#cfe7dc",
    borderWidth: 1
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  buttonTextSecondary: { color: "#0b6b4f" },
  shell: { backgroundColor: "#f7fbf8", flex: 1 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  headerBrand: { alignItems: "center", flexDirection: "row", gap: 10 },
  headerLogo: { borderRadius: 14, height: 42, width: 42 },
  headerTitle: { color: "#123c2f", fontSize: 20, fontWeight: "900" },
  headerSub: { color: "#71847d", fontSize: 12, fontWeight: "600" },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#eaf5ef",
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  body: { flex: 1 },
  content: { gap: 16, padding: 18, paddingBottom: 110 },
  hero: {
    backgroundColor: "#0b6b4f",
    borderRadius: 28,
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
    padding: 22
  },
  eyebrow: { color: "#a9e8ce", fontSize: 13, fontWeight: "800", marginBottom: 8 },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "900", maxWidth: 230 },
  heroText: { color: "#d8f2e6", fontSize: 14, lineHeight: 20, marginTop: 10, maxWidth: 250 },
  scanFab: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#18a46f",
    borderRadius: 22,
    height: 58,
    justifyContent: "center",
    width: 58
  },
  statsGrid: { flexDirection: "row", gap: 12 },
  statCard: {
    backgroundColor: "#fff",
    borderColor: "#e1ece7",
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    padding: 18
  },
  statValue: { color: "#123c2f", fontSize: 24, fontWeight: "900" },
  statLabel: { color: "#73867f", fontSize: 13, fontWeight: "700", marginTop: 2 },
  card: {
    backgroundColor: "#fff",
    borderColor: "#e1ece7",
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 16
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#e1ece7",
    borderRadius: 22,
    borderWidth: 1,
    padding: 28
  },
  emptyTitle: { color: "#123c2f", fontSize: 18, fontWeight: "900", marginTop: 10 },
  emptyText: { color: "#71847d", fontSize: 14, marginTop: 4, textAlign: "center" },
  sectionTitle: { color: "#123c2f", fontSize: 18, fontWeight: "900" },
  recentScanList: { gap: 12 },
  recentScanItem: {
    borderTopColor: "#edf2ef",
    borderTopWidth: 1,
    paddingTop: 12
  },
  recentScanItemFirst: { borderTopWidth: 0, paddingTop: 0 },
  screenTitle: { color: "#123c2f", fontSize: 28, fontWeight: "900" },
  screenSubtitle: { color: "#71847d", fontSize: 15, lineHeight: 21, marginTop: -8 },
  profileStats: { gap: 10 },
  profileStat: {
    backgroundColor: "#f8faf8",
    borderColor: "#dce9e3",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14
  },
  profileStatLabel: { color: "#71847d", fontSize: 12, fontWeight: "800", marginBottom: 4 },
  profileStatValue: { color: "#123c2f", fontSize: 18, fontWeight: "900" },
  profileEmptyText: { color: "#71847d", fontSize: 13, fontWeight: "700" },
  profileActions: { gap: 10 },
  wheelField: {
    backgroundColor: "#f8faf8",
    borderColor: "#dce9e3",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  wheelFieldLabel: { color: "#71847d", fontSize: 12, fontWeight: "800" },
  wheelFieldValue: { color: "#173b2f", fontSize: 16, fontWeight: "900" },
  wheelOverlay: {
    backgroundColor: "#0007",
    flex: 1,
    justifyContent: "flex-end"
  },
  wheelPanel: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "62%",
    padding: 18
  },
  wheelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  wheelDoneButton: {
    backgroundColor: "#eef8f3",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  wheelDoneText: { color: "#0b6b4f", fontSize: 13, fontWeight: "900" },
  wheelList: { gap: 6, paddingBottom: 20 },
  wheelOption: {
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 13
  },
  wheelOptionActive: { backgroundColor: "#0b6b4f" },
  wheelOptionText: { color: "#496159", fontSize: 18, fontWeight: "800" },
  wheelOptionTextActive: { color: "#fff" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  chip: {
    backgroundColor: "#f5faf7",
    borderColor: "#dce9e3",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9
  },
  chipActive: { backgroundColor: "#0b6b4f", borderColor: "#0b6b4f" },
  chipText: { color: "#496159", fontSize: 13, fontWeight: "700" },
  chipTextActive: { color: "#fff" },
  scanPanel: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#e1ece7",
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 26
  },
  barcodeInput: {
    backgroundColor: "#f8faf8",
    borderColor: "#dce9e3",
    borderRadius: 18,
    borderWidth: 1,
    color: "#173b2f",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0,
    paddingHorizontal: 18,
    paddingVertical: 14,
    textAlign: "center",
    width: "100%"
  },
  inputHelp: { color: "#71847d", fontSize: 12, fontWeight: "700", marginTop: -8 },
  cameraWrap: { backgroundColor: "#000", flex: 1 },
  cameraOverlay: { alignItems: "center", flex: 1, justifyContent: "space-between", padding: 24, paddingTop: 60 },
  cameraHeader: { alignItems: "center", gap: 8 },
  cameraTitle: { alignSelf: "center", color: "#fff", fontSize: 18, fontWeight: "900" },
  cameraHint: {
    backgroundColor: "#0008",
    borderRadius: 999,
    color: "#e8fff4",
    fontSize: 13,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 8,
    textAlign: "center"
  },
  scanFrame: {
    borderColor: "#ffffff66",
    borderRadius: 18,
    height: 170,
    justifyContent: "center",
    maxWidth: 340,
    width: "92%"
  },
  scanCorner: {
    borderColor: "#39e58f",
    height: 42,
    position: "absolute",
    width: 42
  },
  scanCornerTopLeft: { borderLeftWidth: 4, borderTopWidth: 4, left: 0, top: 0 },
  scanCornerTopRight: { borderRightWidth: 4, borderTopWidth: 4, right: 0, top: 0 },
  scanCornerBottomLeft: { borderBottomWidth: 4, borderLeftWidth: 4, bottom: 0, left: 0 },
  scanCornerBottomRight: { borderBottomWidth: 4, borderRightWidth: 4, bottom: 0, right: 0 },
  closeButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#0008",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginBottom: 34,
    width: 48
  },
  resultCard: {
    backgroundColor: "#fff",
    borderColor: "#e1ece7",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14
  },
  historyProductCard: {
    backgroundColor: "#fff",
    borderColor: "#e1ece7",
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 14
  },
  resultSummary: {
    flexDirection: "row",
    gap: 12
  },
  resultCompact: { borderWidth: 0, padding: 0 },
  resultIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  productImage: {
    backgroundColor: "#f8faf8",
    borderColor: "#e1ece7",
    borderRadius: 14,
    borderWidth: 1,
    height: 58,
    width: 58
  },
  resultBody: { flex: 1 },
  productName: { color: "#123c2f", fontSize: 16, fontWeight: "900" },
  brand: { color: "#71847d", fontSize: 13, fontWeight: "700", marginTop: 2 },
  resultLabel: { fontSize: 14, fontWeight: "900", marginTop: 8 },
  explanation: { color: "#50645d", fontSize: 13, lineHeight: 19, marginTop: 4 },
  recommendationBox: {
    backgroundColor: "#f8faf8",
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    padding: 12
  },
  recommendationHeader: { alignItems: "center", flexDirection: "row", gap: 7 },
  recommendationTitle: { fontSize: 14, fontWeight: "900" },
  recommendationText: { color: "#50645d", fontSize: 13, lineHeight: 19 },
  alertList: { gap: 3, marginTop: 3 },
  alertText: { color: "#9f1239", fontSize: 12, fontWeight: "700", lineHeight: 17 },
  detailSection: {
    borderColor: "#e1ece7",
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 12
  },
  detailSectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between"
  },
  detailTitleRow: { alignItems: "center", flexDirection: "row", gap: 7 },
  detailSectionTitle: { color: "#1f2933", fontSize: 15, fontWeight: "900" },
  detailMeta: { color: "#71847d", fontSize: 12, fontWeight: "700" },
  detailText: { color: "#60736c", fontSize: 14, lineHeight: 20 },
  categoryPill: {
    backgroundColor: "#eef6f1",
    borderRadius: 999,
    color: "#60736c",
    fontSize: 12,
    fontWeight: "800",
    maxWidth: 130,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  nutritionRow: {
    borderBottomColor: "#edf2ef",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8
  },
  nutritionLabel: { color: "#1f2933", flex: 1, fontSize: 14, fontWeight: "700" },
  nutritionValue: { color: "#1f2933", fontSize: 14, fontWeight: "900", textAlign: "right" },
  allergenWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  allergenPill: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
    borderRadius: 999,
    borderWidth: 1,
    color: "#c2410c",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: "capitalize"
  },
  tabs: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#e1ece7",
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    height: 78,
    justifyContent: "space-around",
    left: 0,
    position: "absolute",
    right: 0
  },
  tab: { alignItems: "center", gap: 4, width: 76 },
  tabText: { color: "#8a9a94", fontSize: 11, fontWeight: "800" },
  tabTextActive: { color: "#0b6b4f" },
  loading: { alignItems: "center", flex: 1, justifyContent: "center" },
  loadingText: { color: "#60736c", fontWeight: "700", marginTop: 10 }
});
