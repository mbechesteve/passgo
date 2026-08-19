import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
  View,
  ViewProps,
} from "react-native";

import { colors } from "@/lib/theme";
import { TOUCH_MIN } from "@/lib/layout";
import { Icon, type IconName } from "@/components/Icon";

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({
  className = "",
  children,
  ...rest
}: ViewProps & { className?: string; children: ReactNode }) {
  return (
    <View
      className={`rounded-card bg-canvas border border-hairline ${className}`}
      style={{
        shadowColor: colors.deep,
        shadowOpacity: 0.06,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
      {...rest}
    >
      {children}
    </View>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "accent";

export function Button({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  className = "",
  ...rest
}: PressableProps & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}) {
  // minimax: "apply rounded.full to every button, every pill tab, every badge".
  const styles: Record<ButtonVariant, { bg: string; text: string }> = {
    primary: { bg: "bg-deep", text: "text-white" },
    secondary: {
      bg: "bg-canvas border border-hairline",
      text: "text-ink",
    },
    ghost: { bg: "bg-transparent", text: "text-ink" },
    accent: { bg: "bg-accent", text: "text-white" },
  };
  const s = styles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      className={`flex-row items-center justify-center rounded-full px-6 py-3.5 active:opacity-80 ${s.bg} ${
        disabled ? "opacity-40" : ""
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" || variant === "ghost" ? colors.deep : "#fff"} />
      ) : (
        <>
          {icon ? <View className="mr-2">{icon}</View> : null}
          <Text className={`font-medium text-[15px] ${s.text}`}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

// ── Pill / chip ───────────────────────────────────────────────────────────────
export function Pill({
  label,
  active,
  icon,
  onPress,
}: {
  label: string;
  active?: boolean;
  icon?: IconName;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={{ minHeight: TOUCH_MIN }}
      className={`mr-2 flex-row items-center rounded-full border px-3.5 py-2 ${
        active
          ? "bg-deep border-deep"
          : "bg-canvas border-hairline"
      }`}
    >
      {icon ? (
        <View className="mr-1.5">
          <Icon name={icon} size={14} color={active ? colors.canvas : colors.body} />
        </View>
      ) : null}
      <Text
        className={`font-medium text-[13px] ${
          active ? "text-white" : "text-body"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ── Section header ──────────────────────────────────────────────────────────────
export function SectionTitle({
  title,
  action,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <View className={`flex-row items-center justify-between ${className}`}>
      <Text className="font-medium text-[17px] text-ink">{title}</Text>
      {action}
    </View>
  );
}

// ── Tag ───────────────────────────────────────────────────────────────────────
export function Tag({ label }: { label: string }) {
  return (
    <View className="self-start rounded-lg bg-panel px-2 py-1">
      <Text className="font-medium text-[11px] text-mute">{label}</Text>
    </View>
  );
}

// ── Stat (icon + value + label) ─────────────────────────────────────────────────
export function Stat({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: IconName;
}) {
  return (
    <View className="flex-1 items-center rounded-xl border border-hairline bg-panel py-3">
      <Icon name={icon} size={16} color={colors.body} />
      <Text className="mt-1.5 font-medium text-[15px] text-ink">{value}</Text>
      <Text className="font-medium text-[11px] text-mute">{label}</Text>
    </View>
  );
}
