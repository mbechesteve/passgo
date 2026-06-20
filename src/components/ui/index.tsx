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
import { Icon, type IconName } from "@/components/Icon";

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({
  className = "",
  children,
  ...rest
}: ViewProps & { className?: string; children: ReactNode }) {
  return (
    <View
      className={`rounded-card bg-surface border border-surface-sunken ${className}`}
      style={{
        shadowColor: colors.ink[900],
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
type ButtonVariant = "primary" | "secondary" | "ghost" | "premium";

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
  // Webflow: near-black primary, white+hairline secondary, 4px radius.
  const styles: Record<ButtonVariant, { bg: string; text: string }> = {
    primary: { bg: "bg-brand-700", text: "text-white" },
    secondary: {
      bg: "bg-surface border border-surface-sunken",
      text: "text-ink-900",
    },
    ghost: { bg: "bg-transparent", text: "text-ink-900" },
    premium: { bg: "bg-ocean-600", text: "text-white" },
  };
  const s = styles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center rounded px-5 py-3.5 active:opacity-80 ${s.bg} ${
        disabled ? "opacity-40" : ""
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" || variant === "ghost" ? colors.brand[700] : "#fff"} />
      ) : (
        <>
          {icon ? <View className="mr-2">{icon}</View> : null}
          <Text className={`text-[15px] font-semibold ${s.text}`}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

// ── Pill / chip ───────────────────────────────────────────────────────────────
export function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 rounded-full border px-3.5 py-2 ${
        active
          ? "bg-brand-700 border-brand-700"
          : "bg-surface border-surface-sunken"
      }`}
    >
      <Text
        className={`text-[13px] font-semibold ${
          active ? "text-white" : "text-ink-700"
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
      <Text className="text-[17px] font-semibold text-ink-900">{title}</Text>
      {action}
    </View>
  );
}

// ── Tag ───────────────────────────────────────────────────────────────────────
export function Tag({ label }: { label: string }) {
  return (
    <View className="self-start rounded-lg bg-surface-muted px-2 py-1">
      <Text className="text-[11px] font-semibold text-ink-500">{label}</Text>
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
    <View className="flex-1 items-center rounded-xl border border-surface-sunken bg-surface-muted py-3">
      <Icon name={icon} size={16} color={colors.ink[700]} />
      <Text className="mt-1.5 text-[15px] font-semibold text-ink-900">{value}</Text>
      <Text className="text-[11px] font-medium text-ink-500">{label}</Text>
    </View>
  );
}
