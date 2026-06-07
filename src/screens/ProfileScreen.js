import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { Chip } from "../components/Chip";
import { PrimaryButton } from "../components/PrimaryButton";
import {
  LEGAL_CONTACT_EMAIL,
  PRIVACY_VERSION,
  TERMS_VERSION,
  privacySections,
  termsSections
} from "../constants/legal";
import { styles } from "../styles/styles";

const weightOptions = Array.from({ length: 221 }, (_, index) => `${index + 30}`);
const heightOptions = Array.from({ length: 131 }, (_, index) => `${index + 100}`);
const DELETE_ACCOUNT_CONFIRMATION = "eliminar la cuenta";

function WheelField({ label, value, unit, options, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable style={styles.wheelField} onPress={() => setOpen(true)}>
        <Text style={styles.wheelFieldLabel}>{label}</Text>
        <Text style={styles.wheelFieldValue}>
          {value ? `${value} ${unit}` : "Seleccionar"}
        </Text>
      </Pressable>

      <Modal animationType="slide" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <View style={styles.wheelOverlay}>
          <View style={styles.wheelPanel}>
            <View style={styles.wheelHeader}>
              <Text style={styles.sectionTitle}>{label}</Text>
              <Pressable onPress={() => setOpen(false)} style={styles.wheelDoneButton}>
                <Text style={styles.wheelDoneText}>Listo</Text>
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.wheelList}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => {
                const active = option === value;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    style={[styles.wheelOption, active && styles.wheelOptionActive]}
                  >
                    <Text style={[styles.wheelOptionText, active && styles.wheelOptionTextActive]}>
                      {option} {unit}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function ChoiceGroup({ title, data, idKey, selected, onToggle, editing }) {
  const selectedItems = data.filter((item) => selected.includes(item[idKey]));

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipWrap}>
        {(editing ? data : selectedItems).map((item) => (
          <Chip
            key={item[idKey]}
            label={item.nombre}
            active={editing ? selected.includes(item[idKey]) : true}
            onPress={editing ? () => onToggle(item[idKey]) : undefined}
          />
        ))}
      </View>
      {!editing && selectedItems.length === 0 ? (
        <Text style={styles.profileEmptyText}>Sin datos cargados</Text>
      ) : null}
    </View>
  );
}

function LegalSection({ title, body }) {
  return (
    <View style={styles.legalSection}>
      <Text style={styles.legalSectionTitle}>{title}</Text>
      <Text style={styles.legalSectionText}>{body}</Text>
    </View>
  );
}

export function ProfileScreen({ catalogos, initialProfile, onDeleteAccount, onSave }) {
  const [edad, setEdad] = useState(`${initialProfile?.edad || ""}`);
  const [peso, setPeso] = useState(`${initialProfile?.peso || ""}`);
  const [altura, setAltura] = useState(`${initialProfile?.altura || ""}`);
  const [enfermedades, setEnfermedades] = useState(
    initialProfile?.enfermedades?.map((item) => item.id_enfermedad) || []
  );
  const [dietas, setDietas] = useState(initialProfile?.dietas?.map((item) => item.id_dieta) || []);
  const [alergias, setAlergias] = useState(
    initialProfile?.alergias?.map((item) => item.id_alergia) || []
  );
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const canDelete = deleteConfirmation.trim() === DELETE_ACCOUNT_CONFIRMATION;

  function resetForm() {
    setEdad(`${initialProfile?.edad || ""}`);
    setPeso(`${initialProfile?.peso || ""}`);
    setAltura(`${initialProfile?.altura || ""}`);
    setEnfermedades(initialProfile?.enfermedades?.map((item) => item.id_enfermedad) || []);
    setDietas(initialProfile?.dietas?.map((item) => item.id_dieta) || []);
    setAlergias(initialProfile?.alergias?.map((item) => item.id_alergia) || []);
  }

  useEffect(() => {
    if (!editing) resetForm();
  }, [initialProfile, editing]);

  function toggle(list, setList, id) {
    setList(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  async function save() {
    setLoading(true);
    try {
      await onSave({
        edad: Number(edad) || null,
        peso: Number(peso) || null,
        altura: Number(altura) || null,
        enfermedades,
        dietas,
        alergias
      });
      setEditing(false);
    } finally {
      setLoading(false);
    }
  }

  function cancelEdit() {
    resetForm();
    setEditing(false);
  }

  function closeDeleteModal() {
    if (deleting) return;
    setDeleteOpen(false);
    setDeleteConfirmation("");
  }

  async function confirmDeleteAccount() {
    if (!canDelete) return;
    setDeleting(true);
    try {
      await onDeleteAccount(deleteConfirmation.trim());
      setDeleteOpen(false);
      setDeleteConfirmation("");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Perfil de salud</Text>
      <Text style={styles.screenSubtitle}>Estos datos personalizan cada recomendacion.</Text>

      <View style={styles.card}>
        {editing ? (
          <>
            <View style={styles.row}>
              <TextInput
                keyboardType="numeric"
                placeholder="Edad"
                value={edad}
                onChangeText={setEdad}
                maxLength={3}
                style={[styles.input, styles.rowInput]}
              />
              <WheelField
                label="Peso"
                value={peso}
                unit="kg"
                options={weightOptions}
                onChange={setPeso}
              />
            </View>
            <WheelField
              label="Altura"
              value={altura}
              unit="cm"
              options={heightOptions}
              onChange={setAltura}
            />
          </>
        ) : (
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatLabel}>Edad</Text>
              <Text style={styles.profileStatValue}>{edad || "Sin dato"}</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatLabel}>Peso</Text>
              <Text style={styles.profileStatValue}>{peso ? `${peso} kg` : "Sin dato"}</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatLabel}>Altura</Text>
              <Text style={styles.profileStatValue}>{altura ? `${altura} cm` : "Sin dato"}</Text>
            </View>
          </View>
        )}
      </View>

      <ChoiceGroup
        title="Enfermedades"
        data={catalogos.enfermedades}
        idKey="id_enfermedad"
        selected={enfermedades}
        onToggle={(id) => toggle(enfermedades, setEnfermedades, id)}
        editing={editing}
      />
      <ChoiceGroup
        title="Dietas"
        data={catalogos.dietas}
        idKey="id_dieta"
        selected={dietas}
        onToggle={(id) => toggle(dietas, setDietas, id)}
        editing={editing}
      />
      <ChoiceGroup
        title="Alergias"
        data={catalogos.alergias}
        idKey="id_alergia"
        selected={alergias}
        onToggle={(id) => toggle(alergias, setAlergias, id)}
        editing={editing}
      />

      {editing ? (
        <View style={styles.profileActions}>
          <PrimaryButton icon="save-outline" label="Guardar perfil" loading={loading} onPress={save} />
          <PrimaryButton
            icon="close-outline"
            label="Cancelar"
            loading={false}
            onPress={cancelEdit}
            variant="secondary"
          />
        </View>
      ) : (
        <PrimaryButton
          icon="create-outline"
          label="Editar perfil"
          loading={false}
          onPress={() => setEditing(true)}
        />
      )}

      <View style={styles.card}>
        <View style={styles.detailSectionHeader}>
          <View style={styles.detailTitleRow}>
            <Ionicons name="document-text-outline" size={18} color="#0b6b4f" />
            <Text style={styles.sectionTitle}>Legales</Text>
          </View>
        </View>
        <Text style={styles.detailText}>
          Terminos v{TERMS_VERSION} | Privacidad v{PRIVACY_VERSION}
        </Text>
        <Text style={styles.detailText}>Contacto: {LEGAL_CONTACT_EMAIL}</Text>
        <PrimaryButton
          icon="eye-outline"
          label="Ver terminos y privacidad"
          loading={false}
          onPress={() => setLegalOpen(true)}
          variant="secondary"
        />
      </View>

      <View style={[styles.card, styles.dangerZone]}>
        <View style={styles.detailTitleRow}>
          <Ionicons name="trash-outline" size={18} color="#b42318" />
          <Text style={styles.dangerTitle}>Eliminar cuenta</Text>
        </View>
        <Text style={styles.dangerText}>
          Borra tu perfil de salud, alergias, dietas, condiciones, historial de escaneos y cuenta de acceso.
        </Text>
        <Pressable onPress={() => setDeleteOpen(true)} style={styles.dangerButton}>
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={styles.dangerButtonText}>Eliminar mi cuenta</Text>
        </Pressable>
      </View>

      <Modal animationType="slide" transparent visible={legalOpen} onRequestClose={() => setLegalOpen(false)}>
        <View style={styles.wheelOverlay}>
          <View style={styles.legalModalPanel}>
            <View style={styles.wheelHeader}>
              <Text style={styles.sectionTitle}>Terminos y privacidad</Text>
              <Pressable onPress={() => setLegalOpen(false)} style={styles.wheelDoneButton}>
                <Text style={styles.wheelDoneText}>Cerrar</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.legalModalContent}>
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent visible={deleteOpen} onRequestClose={closeDeleteModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.deleteModalOverlay}
        >
          <View style={styles.deleteModalPanel}>
            <View style={styles.detailTitleRow}>
              <Ionicons name="warning-outline" size={22} color="#b42318" />
              <Text style={styles.dangerModalTitle}>Eliminar cuenta</Text>
            </View>
            <Text style={styles.dangerText}>
              Esta accion elimina tus datos sensibles y no se puede deshacer. Para confirmar, escribi:
            </Text>
            <Text style={styles.deletePhrase}>{DELETE_ACCOUNT_CONFIRMATION}</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!deleting}
              placeholder={DELETE_ACCOUNT_CONFIRMATION}
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              style={styles.deleteConfirmInput}
            />
            <Pressable
              disabled={!canDelete || deleting}
              onPress={confirmDeleteAccount}
              style={[styles.dangerButton, (!canDelete || deleting) && styles.dangerButtonDisabled]}
            >
              {deleting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.dangerButtonText}>Eliminar definitivamente</Text>
                </>
              )}
            </Pressable>
            <Pressable disabled={deleting} onPress={closeDeleteModal} style={styles.authLink}>
              <Text style={styles.authLinkText}>Cancelar</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
