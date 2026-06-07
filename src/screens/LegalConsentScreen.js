import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import {
  LEGAL_CONTACT_EMAIL,
  PRIVACY_VERSION,
  TERMS_VERSION,
  privacySections,
  termsSections
} from "../constants/legal";
import { styles } from "../styles/styles";

function LegalSection({ title, body }) {
  return (
    <View style={styles.legalSection}>
      <Text style={styles.legalSectionTitle}>{title}</Text>
      <Text style={styles.legalSectionText}>{body}</Text>
    </View>
  );
}

export function LegalConsentScreen({ onAccept, onReject }) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function acceptLegal() {
    if (!accepted) {
      Alert.alert("Aceptacion requerida", "Para usar BioTag tenes que aceptar los terminos y la politica de privacidad.");
      return;
    }

    setLoading(true);
    try {
      await onAccept();
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={["#e9f8ef", "#f9fbf8"]} style={styles.authBg}>
      <ScrollView contentContainerStyle={styles.legalWrap}>
        <View style={styles.legalCard}>
          <View style={styles.legalHeaderIcon}>
            <Ionicons name="shield-checkmark-outline" size={28} color="#0b6b4f" />
          </View>
          <Text style={styles.legalTitle}>Antes de continuar</Text>
          <Text style={styles.legalIntro}>
            BioTag usa tu perfil de salud y datos de productos para darte recomendaciones alimentarias orientativas.
          </Text>

          <View style={styles.legalMetaRow}>
            <Text style={styles.legalMeta}>Terminos v{TERMS_VERSION}</Text>
            <Text style={styles.legalMeta}>Privacidad v{PRIVACY_VERSION}</Text>
          </View>

          <View style={styles.legalBlock}>
            <Text style={styles.legalBlockTitle}>Terminos y condiciones</Text>
            {termsSections.map((section) => (
              <LegalSection key={section.title} title={section.title} body={section.body} />
            ))}
          </View>

          <View style={styles.legalBlock}>
            <Text style={styles.legalBlockTitle}>Politica de privacidad</Text>
            {privacySections.map((section) => (
              <LegalSection key={section.title} title={section.title} body={section.body} />
            ))}
          </View>

          <Text style={styles.legalContact}>Contacto: {LEGAL_CONTACT_EMAIL}</Text>

          <Pressable
            onPress={() => setAccepted((value) => !value)}
            style={styles.legalCheckRow}
          >
            <View style={[styles.legalCheckbox, accepted && styles.legalCheckboxActive]}>
              {accepted ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
            </View>
            <Text style={styles.legalCheckText}>
              Lei y acepto los Terminos y Condiciones y la Politica de Privacidad.
            </Text>
          </Pressable>

          <Pressable
            disabled={loading || !accepted}
            onPress={acceptLegal}
            style={[styles.button, (!accepted || loading) && styles.buttonDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>Aceptar y continuar</Text>
              </>
            )}
          </Pressable>

          <Pressable disabled={loading} onPress={onReject} style={styles.authLink}>
            <Text style={styles.authLinkText}>No aceptar y cerrar sesion</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
