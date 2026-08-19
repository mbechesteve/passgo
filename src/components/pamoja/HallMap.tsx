import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Line, Rect } from "react-native-svg";

import { colors } from "@/lib/theme";
import { S } from "@/lib/strings";
import { BOWL_INSET, blockRects, isSoldOut } from "@/utils/hallmap";
import type { HallMap as HallMapData, StadiumBlock } from "@/types";

/**
 * The bowl, block by block: two stands across, two down, the pitch between them.
 *
 * Category is shown as depth of the one accent, not as a colour code — three tiers
 * would otherwise need three hues, and DESIGN.md allows two. Cat 1 is the full
 * accent, Cat 3 the faintest, and a sold-out block drops out of the hue entirely
 * into `panel`, so what a fan cannot buy is legible before they tap it.
 *
 * SVG paints; React Native handles the touches. The rects come from `blockRects`, so
 * the same geometry positions the paint and the pressables, and each block gets a
 * real accessibility label rather than an unlabelled shape.
 */
export function HallMap({
  map,
  width,
  height,
  selectedId,
  onSelect,
}: {
  map: HallMapData;
  width: number;
  height: number;
  selectedId: string | null;
  onSelect: (block: StadiumBlock) => void;
}) {
  const rects = blockRects(map.blocks, width, height);
  const at = (id: string) => rects.find((r) => r.id === id);

  const fill = (block: StadiumBlock) =>
    isSoldOut(block) ? colors.panel : colors.accent;
  // Cat 1 full strength, Cat 3 faintest — one hue, three depths.
  const opacity = (block: StadiumBlock) =>
    isSoldOut(block) ? 1 : { 1: 1, 2: 0.55, 3: 0.25 }[block.category];
  // The faintest tier cannot carry white text, so its label goes dark instead. A
  // block's label has to be readable in every state or the map is decoration.
  const labelColor = (block: StadiumBlock) => {
    if (isSoldOut(block)) return colors.faint;
    return block.category === 3 ? colors.accent : colors.canvas;
  };

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {/* The pitch. Inset by the stand bands on every side. */}
        <Rect
          x={BOWL_INSET}
          y={BOWL_INSET}
          width={Math.max(0, width - BOWL_INSET * 2)}
          height={Math.max(0, height - BOWL_INSET * 2)}
          rx={4}
          fill={colors.surface}
          stroke={colors.hairline}
        />
        <Line
          x1={width / 2}
          y1={BOWL_INSET}
          x2={width / 2}
          y2={height - BOWL_INSET}
          stroke={colors.hairline}
        />
        <Circle cx={width / 2} cy={height / 2} r={16} fill="none" stroke={colors.hairline} />

        {map.blocks.map((block) => {
          const r = at(block.id);
          if (!r) return null;
          return (
            <Rect
              key={block.id}
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              rx={3}
              fill={fill(block)}
              fillOpacity={opacity(block)}
              stroke={selectedId === block.id ? colors.deep : "transparent"}
              strokeWidth={2}
            />
          );
        })}
      </Svg>

      {map.blocks.map((block) => {
        const r = at(block.id);
        if (!r) return null;
        const soldOut = isSoldOut(block);
        return (
          <Pressable
            key={block.id}
            disabled={soldOut}
            onPress={() => onSelect(block)}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedId === block.id, disabled: soldOut }}
            accessibilityLabel={`${S.officeBlockPrefix} ${block.label}${
              soldOut ? `, ${S.officeSoldOut}` : ""
            }`}
            style={{
              position: "absolute",
              left: r.x,
              top: r.y,
              width: r.w,
              height: r.h,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              className="font-mono text-[9px]"
              style={{ color: labelColor(block) }}
            >
              {block.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
