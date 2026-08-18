import { Text } from "react-native";

/**
 * The uppercase mono label the proposal sets every section and figure in:
 * "SECTION 03 / 10", "OFFERS NEAR YOU", "2,189 PARTNER BUSINESSES".
 */
export function Eyebrow({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <Text
      className={`font-mono text-[11px] uppercase tracking-[1.5px] text-mute ${className}`}
    >
      {children}
    </Text>
  );
}
