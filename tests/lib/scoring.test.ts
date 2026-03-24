import { describe, it, expect } from "vitest";
import { getTrafficLight, getScoreColor, COLORS } from "@/lib/constants";
import { computeFactionResult, computePartyScore, computeMemberDeviations } from "@/lib/scoring";

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

describe("computeFactionResult", () => {
  it("returns ja when majority votes ja", () => {
    const votes = [
      { result: "ja" as const },
      { result: "ja" as const },
      { result: "nein" as const },
    ];
    expect(computeFactionResult(votes)).toBe("ja");
  });

  it("returns nein when majority votes nein", () => {
    const votes = [
      { result: "nein" as const },
      { result: "nein" as const },
      { result: "ja" as const },
    ];
    expect(computeFactionResult(votes)).toBe("nein");
  });

  it("returns enthaltung on tie", () => {
    const votes = [
      { result: "ja" as const },
      { result: "nein" as const },
    ];
    expect(computeFactionResult(votes)).toBe("enthaltung");
  });

  it("ignores abwesend members", () => {
    const votes = [
      { result: "ja" as const },
      { result: "abwesend" as const },
      { result: "abwesend" as const },
    ];
    expect(computeFactionResult(votes)).toBe("ja");
  });
});

describe("computePartyScore", () => {
  it("averages alignment values and rounds", () => {
    const analyses = [
      { alignment: 0.8, confidence: 0.9 },
      { alignment: 0.6, confidence: 0.85 },
    ];
    expect(computePartyScore(analyses)).toBe(70);
  });

  it("filters out low confidence analyses", () => {
    const analyses = [
      { alignment: 0.9, confidence: 0.95 },
      { alignment: 0.1, confidence: 0.5 },
    ];
    expect(computePartyScore(analyses)).toBe(90);
  });

  it("returns 0 when no analyses pass threshold", () => {
    const analyses = [
      { alignment: 0.5, confidence: 0.3 },
    ];
    expect(computePartyScore(analyses)).toBe(0);
  });
});

describe("computeMemberDeviations", () => {
  it("counts deviations where alignment < 0.5", () => {
    const analyses = [
      { alignment: 0.9 },
      { alignment: 0.3 },
      { alignment: 0.1 },
      { alignment: 0.7 },
    ];
    expect(computeMemberDeviations(analyses)).toBe(2);
  });
});
