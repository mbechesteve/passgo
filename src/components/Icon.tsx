import Feather from "@expo/vector-icons/Feather";

import { colors } from "@/lib/theme";

export type IconName = React.ComponentProps<typeof Feather>["name"];

/** Thin wrapper over Feather so the app uses one consistent line-icon set. */
export function Icon({
  name,
  size = 16,
  color = colors.ink,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Feather name={name} size={size} color={color} />;
}
