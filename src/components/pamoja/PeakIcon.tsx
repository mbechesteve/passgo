import Svg, { G, Path } from "react-native-svg";

import { colors } from "@/lib/theme";
import { peakGlyphPath } from "@/utils/peaks";

/**
 * The Explore tab's icon: the same summit as `PeakFrame`, stroked instead of
 * filled. Both read their geometry from `peakGlyphPath`/`peakMaskPath`, so the
 * icon and the media frame can never drift into two different mountains.
 *
 * Stroke weight, caps and joins match Feather, which draws the other four tabs —
 * one bespoke icon among five is the arrangement the reference uses too, where only
 * its Places tab carries the national shape. The glyph is inset by the stroke's own
 * width so the outer edge is not clipped by the viewport.
 */
export function PeakIcon({
  size = 22,
  color = colors.ink,
}: {
  size?: number;
  color?: string;
}) {
  const inset = 2;
  const width = size - inset * 2;
  // Drawn squat rather than square. At full height the summit becomes a spike that
  // reads taller and thinner than the Feather glyphs beside it; at about seven-tenths,
  // centred, it matches their optical size and still reads as a mountain.
  const height = Math.round(size * 0.72);
  return (
    <Svg width={size} height={size}>
      <G x={inset} y={(size - height) / 2}>
        <Path
          d={peakGlyphPath(width, height)}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}
