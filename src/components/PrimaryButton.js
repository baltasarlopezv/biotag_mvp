import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { styles } from "../styles/styles";

export function PrimaryButton({ icon, label, loading, onPress, variant = "primary" }) {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={[styles.button, variant === "secondary" && styles.buttonSecondary]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? "#0b6b4f" : "#fff"} />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={variant === "secondary" ? "#0b6b4f" : "#fff"}
            />
          ) : null}
          <Text
            style={[
              styles.buttonText,
              variant === "secondary" && styles.buttonTextSecondary
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
