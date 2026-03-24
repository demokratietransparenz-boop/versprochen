import { describe, it, expect } from "vitest";
import { getTrafficLight, getScoreColor, COLORS } from "@/lib/constants";

describe("getTrafficLight", () => {
  it("returns gruen for scores >= 70", () => {
    expect(getTrafficLight(70)).toBe("gruen");
    expect(getTrafficLight(100)).toBe("gruen");
  });

  it("returns gelb for scores 50-69", () => {
    expect(getTrafficLight(50)).toBe("gelb");
    expect(getTrafficLight(69)).toBe("gelb");
  });

  it("returns rot for scores < 50", () => {
    expect(getTrafficLight(49)).toBe("rot");
    expect(getTrafficLight(0)).toBe("rot");
  });
});

describe("getScoreColor", () => {
  it("returns green hex for high scores", () => {
    expect(getScoreColor(80)).toBe(COLORS.scoreGreen);
  });

  it("returns orange hex for medium scores", () => {
    expect(getScoreColor(55)).toBe(COLORS.scoreOrange);
  });

  it("returns red hex for low scores", () => {
    expect(getScoreColor(30)).toBe(COLORS.scoreRed);
  });
});
