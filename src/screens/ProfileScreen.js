import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { Chip } from "../components/Chip";
import { PrimaryButton } from "../components/PrimaryButton";
import { styles } from "../styles/styles";

function ChoiceGroup({ title, data, idKey, selected, onToggle }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipWrap}>
        {data.map((item) => (
          <Chip
            key={item[idKey]}
            label={item.nombre}
            active={selected.includes(item[idKey])}
            onPress={() => onToggle(item[idKey])}
          />
        ))}
      </View>
    </View>
  );
}

export function ProfileScreen({ catalogos, initialProfile, onSave }) {
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

  function toggle(list, setList, id) {
    setList(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  async function save() {
    setLoading(true);
    await onSave({
      edad: Number(edad) || null,
      peso: Number(peso) || null,
      altura: Number(altura) || null,
      enfermedades,
      dietas,
      alergias
    });
    setLoading(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Perfil de salud</Text>
      <Text style={styles.screenSubtitle}>Estos datos personalizan cada recomendacion.</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <TextInput
            keyboardType="numeric"
            placeholder="Edad"
            value={edad}
            onChangeText={setEdad}
            style={[styles.input, styles.rowInput]}
          />
          <TextInput
            keyboardType="decimal-pad"
            placeholder="Peso kg"
            value={peso}
            onChangeText={setPeso}
            style={[styles.input, styles.rowInput]}
          />
        </View>
        <TextInput
          keyboardType="decimal-pad"
          placeholder="Altura cm"
          value={altura}
          onChangeText={setAltura}
          style={styles.input}
        />
      </View>

      <ChoiceGroup
        title="Enfermedades"
        data={catalogos.enfermedades}
        idKey="id_enfermedad"
        selected={enfermedades}
        onToggle={(id) => toggle(enfermedades, setEnfermedades, id)}
      />
      <ChoiceGroup
        title="Dietas"
        data={catalogos.dietas}
        idKey="id_dieta"
        selected={dietas}
        onToggle={(id) => toggle(dietas, setDietas, id)}
      />
      <ChoiceGroup
        title="Alergias"
        data={catalogos.alergias}
        idKey="id_alergia"
        selected={alergias}
        onToggle={(id) => toggle(alergias, setAlergias, id)}
      />

      <PrimaryButton icon="save-outline" label="Guardar perfil" loading={loading} onPress={save} />
    </ScrollView>
  );
}
