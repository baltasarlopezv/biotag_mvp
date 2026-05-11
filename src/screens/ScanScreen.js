import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { styles } from "../styles/styles";

const PRODUCT_BARCODE_TYPES = ["ean13", "ean8", "upc_a", "upc_e"];

function normalizeBarcode(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 13);
}

function hasValidEan13Checksum(code) {
  if (!/^\d{13}$/.test(code)) return false;

  const digits = code.split("").map(Number);
  const checkDigit = digits[12];
  const sum = digits.slice(0, 12).reduce((total, digit, index) => {
    return total + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);
  const expectedCheckDigit = (10 - (sum % 10)) % 10;

  return checkDigit === expectedCheckDigit;
}

function hasValidEan8Checksum(code) {
  if (!/^\d{8}$/.test(code)) return false;

  const digits = code.split("").map(Number);
  const checkDigit = digits[7];
  const sum = digits.slice(0, 7).reduce((total, digit, index) => {
    return total + digit * (index % 2 === 0 ? 3 : 1);
  }, 0);
  const expectedCheckDigit = (10 - (sum % 10)) % 10;

  return checkDigit === expectedCheckDigit;
}

function validateBarcode(value, scannedType) {
  const code = normalizeBarcode(value);
  if (!code) return { code, error: "Ingresa o escanea un codigo de barras." };

  if (scannedType === "ean13" || code.length === 13) {
    if (!hasValidEan13Checksum(code)) return { code, error: "El checksum del codigo EAN-13 no es valido." };
    return { code, error: null };
  }

  if (scannedType === "ean8" || code.length === 8) {
    if (!hasValidEan8Checksum(code)) return { code, error: "El checksum del codigo EAN-8 no es valido." };
    return { code, error: null };
  }

  if (scannedType === "upc_a" && code.length === 12) return { code, error: null };
  if (scannedType === "upc_e" && (code.length === 6 || code.length === 8)) return { code, error: null };

  if (!scannedType && code.length >= 6 && code.length <= 13) return { code, error: null };

  return { code, error: "El codigo debe tener entre 6 y 13 digitos." };
}

function validateScannedBarcode(value, scannedType) {
  const code = normalizeBarcode(value);
  if (!code) return { code, error: "No se pudo leer el codigo." };
  if (!PRODUCT_BARCODE_TYPES.includes(scannedType)) return validateBarcode(code);
  if (code.length < 6 || code.length > 13) return { code, error: "El codigo leido no parece EAN o UPC." };
  return { code, error: null };
}

function getFormatLabel(scannedType) {
  if (scannedType === "ean13") return "EAN-13";
  if (scannedType === "ean8") return "EAN-8";
  if (scannedType === "upc_a") return "UPC-A";
  if (scannedType === "upc_e") return "UPC-E";
  return "codigo";
}

function getScannedType(event) {
  return event.type || event.barcodeType || event.cornerPoints?.type;
}

function getScannerMessage(scannedType) {
  const label = getFormatLabel(scannedType);
  if (label === "codigo") return "Codigo detectado. Analizando producto...";
  return `${label} detectado. Analizando producto...`;
}

export function ScanScreen({ onScan }) {
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("Apunta al codigo de barras del producto.");
  const [permission, requestPermission] = useCameraPermissions();
  const scanLockRef = useRef(false);
  const lastCodeRef = useRef("");

  async function submit(code = barcode) {
    const result = validateBarcode(code);
    if (result.error) {
      Alert.alert("Codigo invalido", result.error);
      return;
    }

    setLoading(true);
    setScanning(false);
    try {
      await onScan(result.code);
    } finally {
      setLoading(false);
      scanLockRef.current = false;
    }
  }

  async function openCamera() {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Camara bloqueada", "Activa el permiso de camara para escanear codigos de barras.");
        return;
      }
    }
    scanLockRef.current = false;
    lastCodeRef.current = "";
    setScannerMessage("Apunta al codigo de barras del producto.");
    setScanning(true);
  }

  function handleBarcodeScanned(event) {
    if (scanLockRef.current) return;

    const scannedType = getScannedType(event);
    console.log("[Scanner] Barcode event", { type: scannedType, data: event.data });
    const result = validateScannedBarcode(event.data, scannedType);
    if (result.error) {
      if (lastCodeRef.current !== result.code) {
        lastCodeRef.current = result.code;
        setScannerMessage(result.error);
      }
      return;
    }

    scanLockRef.current = true;
    lastCodeRef.current = result.code;
    setBarcode(result.code);
    setScannerMessage(getScannerMessage(scannedType));
    submit(result.code);
  }

  if (scanning) {
    return (
      <View style={styles.cameraWrap}>
        <CameraView
          onCameraReady={() => setScannerMessage("Camara lista. Acerca el codigo y mantenelo horizontal.")}
          onMountError={(event) => {
            console.log("[Scanner] Camera mount error", event);
            setScannerMessage("No se pudo iniciar la camara.");
          }}
          onBarcodeScanned={handleBarcodeScanned}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cameraOverlay}>
          <View style={styles.cameraHeader}>
            <Text style={styles.cameraTitle}>Escanear codigo</Text>
            <Text style={styles.cameraHint}>{scannerMessage}</Text>
          </View>
          <View style={styles.scanFrame}>
            <View style={[styles.scanCorner, styles.scanCornerTopLeft]} />
            <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
            <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
            <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
          </View>
          <Pressable onPress={() => setScanning(false)} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Escanear producto</Text>
      <Text style={styles.screenSubtitle}>Escanea un codigo EAN o UPC, o ingresalo manualmente.</Text>

      <View style={styles.scanPanel}>
        <Ionicons name="barcode-outline" size={70} color="#0b6b4f" />
        <TextInput
          maxLength={13}
          keyboardType="number-pad"
          placeholder="Codigo de barras"
          value={barcode}
          onChangeText={(value) => setBarcode(normalizeBarcode(value))}
          style={styles.barcodeInput}
        />
        <Text style={styles.inputHelp}>EAN-13, EAN-8, UPC-A o UPC-E</Text>
        <PrimaryButton icon="camera-outline" label="Escanear codigo" onPress={openCamera} variant="secondary" />
        <PrimaryButton icon="sparkles-outline" label="Analizar producto" loading={loading} onPress={() => submit()} />
      </View>
    </ScrollView>
  );
}
