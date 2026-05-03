import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { styles } from "../styles/styles";

export function ScanScreen({ onScan }) {
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  async function submit(code = barcode) {
    if (!code) return Alert.alert("Falta codigo", "Ingresa o escanea un codigo de barras.");
    setLoading(true);
    setScanning(false);
    try {
      await onScan(code);
    } finally {
      setLoading(false);
    }
  }

  async function openCamera() {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setScanning(true);
  }

  if (scanning) {
    return (
      <View style={styles.cameraWrap}>
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
          onBarcodeScanned={({ data }) => submit(data)}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraTitle}>Centra el codigo de barras</Text>
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
      <Text style={styles.screenSubtitle}>Usa la camara o ingresa el codigo manualmente.</Text>

      <View style={styles.scanPanel}>
        <Ionicons name="barcode-outline" size={70} color="#0b6b4f" />
        <TextInput
          keyboardType="number-pad"
          placeholder="Codigo de barras"
          value={barcode}
          onChangeText={setBarcode}
          style={styles.barcodeInput}
        />
        <PrimaryButton icon="camera-outline" label="Abrir camara" onPress={openCamera} variant="secondary" />
        <PrimaryButton icon="sparkles-outline" label="Analizar producto" loading={loading} onPress={() => submit()} />
      </View>
    </ScrollView>
  );
}
