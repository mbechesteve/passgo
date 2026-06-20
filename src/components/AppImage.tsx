import { Image as ExpoImage, type ImageContentFit } from "expo-image";
import { cssInterop } from "nativewind";
import type { ImageStyle, StyleProp } from "react-native";

// Enable Tailwind className → style on expo-image (for sizing like h-44 w-full).
cssInterop(ExpoImage, { className: "style" });

/**
 * App-wide image. Uses expo-image for memory+disk caching, efficient decoding
 * and a smooth fade-in. A neutral placeholder color fills the box while the
 * image loads, so it reads as a skeleton instead of a blank flash.
 */
export function AppImage({
  uri,
  className,
  style,
  contentFit = "cover",
}: {
  uri: string;
  className?: string;
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
}) {
  return (
    <ExpoImage
      className={className}
      style={[{ backgroundColor: "#eceef1" }, style]}
      source={uri}
      contentFit={contentFit}
      transition={220}
      cachePolicy="memory-disk"
    />
  );
}
