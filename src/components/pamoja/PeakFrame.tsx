import { useId, type ReactNode } from "react";
import { View } from "react-native";
import Svg, {
  ClipPath,
  Defs,
  Image as SvgImage,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

import { colors } from "@/lib/theme";
import { peakMaskPath } from "@/utils/peaks";

/**
 * The frame every image in the app is cropped to: Mount Kenya's split summit cut
 * into the top edge, square base with the app's card radius. One component, so the
 * crop is a national shape by construction and no screen re-invents it.
 *
 * The media is drawn inside the SVG rather than masked from outside — masking an
 * ordinary React Native view would need a second dependency, and `react-native-svg`
 * can already clip an image and fill a path with a gradient. `uri` is therefore the
 * media, and `children` are whatever sits *over* it.
 *
 * With no `uri` it fills with the deep gradient. That is what every instance renders
 * until licensed venue photography exists — a card never shows a photograph that
 * isn't of the place it names.
 *
 * `children` are laid into the bottom third, clear of the peaks. The crown is the
 * one angular thing in the app and it would compete with anything set across it, so
 * the component places captions where they stay legible instead of trusting each
 * caller to remember.
 */
export function PeakFrame({
  width,
  height,
  uri,
  radius = 10,
  children,
}: {
  width: number;
  height: number;
  uri?: string;
  radius?: number;
  children?: ReactNode;
}) {
  // useId, not a module counter: two frames on one screen must not share `defs`
  // ids, and ids have to survive re-renders without reshuffling.
  const key = useId().replace(/:/g, "");
  const clip = `peak-clip-${key}`;
  const grad = `peak-grad-${key}`;
  const d = peakMaskPath(width, height, radius);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <ClipPath id={clip}>
            <Path d={d} />
          </ClipPath>
          <LinearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.deep} />
            <Stop offset="0.55" stopColor={colors.deepGrad} />
            <Stop offset="1" stopColor={colors.deepDeeper} />
          </LinearGradient>
        </Defs>

        {uri ? (
          <SvgImage
            href={uri}
            width={width}
            height={height}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clip})`}
          />
        ) : (
          <Path d={d} fill={`url(#${grad})`} />
        )}
      </Svg>

      {children ? (
        <View
          className="absolute left-0 right-0 justify-end px-4 pb-4"
          style={{ top: height * (2 / 3), bottom: 0 }}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}
