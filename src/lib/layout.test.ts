import { describe, expect, it } from "vitest";

import { CONTENT_MAX, PHONE_FRAME_WIDTH, RAIL_WIDTH, WIDE_MIN, layoutMode } from "./layout";

describe("layoutMode", () => {
  it("treats a phone as a phone", () => {
    expect(layoutMode(390)).toBe("phone");
    expect(layoutMode(420)).toBe("phone");
  });

  it("keeps a tablet on the phone column — the rail is a desktop arrangement", () => {
    expect(layoutMode(820)).toBe("phone");
    expect(layoutMode(WIDE_MIN - 1)).toBe("phone");
  });

  it("switches at the breakpoint itself, not one pixel after", () => {
    expect(layoutMode(WIDE_MIN)).toBe("wide");
  });

  it("stays wide however wide it gets", () => {
    expect(layoutMode(1440)).toBe("wide");
    expect(layoutMode(3840)).toBe("wide");
  });

  it("does not fall over on a zero or negative measurement", () => {
    expect(layoutMode(0)).toBe("phone");
    expect(layoutMode(-1)).toBe("phone");
  });
});

describe("the layout constants", () => {
  it("leaves the content column room beside the rail at the breakpoint", () => {
    expect(RAIL_WIDTH + CONTENT_MAX).toBeLessThanOrEqual(WIDE_MIN);
  });

  it("gives the wide column more room than the phone frame, or it is pointless", () => {
    expect(CONTENT_MAX).toBeGreaterThan(PHONE_FRAME_WIDTH);
  });
});
