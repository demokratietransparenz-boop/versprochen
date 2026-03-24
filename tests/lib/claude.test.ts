import { describe, it, expect } from "vitest";
import {
  parseCategoryResponse,
  parseMatchResponse,
  parseAnalysisResponse,
  buildCategoryPrompt,
  buildMatchPrompt,
  buildAnalysisPrompt,
} from "@/lib/claude";

describe("parseCategoryResponse", () => {
  it("extracts category from response", () => {
    expect(parseCategoryResponse("Klimapolitik")).toBe("Klimapolitik");
  });

  it("trims whitespace", () => {
    expect(parseCategoryResponse("  Sozialpolitik  \n")).toBe("Sozialpolitik");
  });

  it("returns null for invalid category", () => {
    expect(parseCategoryResponse("Ungültig")).toBeNull();
  });
});

describe("parseMatchResponse", () => {
  it("parses valid match JSON", () => {
    const raw = '{"match": 3, "expected_vote": "ja", "reasoning": "Passt."}';
    const result = parseMatchResponse(raw);
    expect(result).toEqual({ match: 3, expected_vote: "ja", reasoning: "Passt." });
  });

  it("parses no-match response", () => {
    const raw = '{"match": null, "expected_vote": null, "reasoning": "Kein Bezug."}';
    const result = parseMatchResponse(raw);
    expect(result.match).toBeNull();
  });

  it("throws on invalid JSON", () => {
    expect(() => parseMatchResponse("not json")).toThrow();
  });
});

describe("parseAnalysisResponse", () => {
  it("parses valid analysis JSON", () => {
    const raw = JSON.stringify({
      alignment: 0.85,
      reasoning: "Stimmt überein.",
      reasoning_simple: "Die Partei hat gemacht was sie versprochen hat.",
      confidence: 0.92,
    });
    const result = parseAnalysisResponse(raw);
    expect(result.alignment).toBe(0.85);
    expect(result.confidence).toBe(0.92);
    expect(result.reasoning_simple).toContain("versprochen");
  });

  it("throws if alignment is out of range", () => {
    const raw = JSON.stringify({
      alignment: 1.5,
      reasoning: "x",
      reasoning_simple: "x",
      confidence: 0.9,
    });
    expect(() => parseAnalysisResponse(raw)).toThrow();
  });
});

describe("buildCategoryPrompt", () => {
  it("includes vote title and description", () => {
    const prompt = buildCategoryPrompt("Klimagesetz", "Ein neues Gesetz");
    expect(prompt).toContain("Klimagesetz");
    expect(prompt).toContain("Ein neues Gesetz");
    expect(prompt).toContain("Klimapolitik");
  });
});

describe("buildMatchPrompt", () => {
  it("includes party name and promises", () => {
    const promises = [
      { index: 1, text: "Mindestlohn erhöhen" },
      { index: 2, text: "Steuern senken" },
    ];
    const prompt = buildMatchPrompt("SPD", "Mindestlohn-Gesetz", "Beschreibung", "2026-03-15", promises);
    expect(prompt).toContain("SPD");
    expect(prompt).toContain("Mindestlohn erhöhen");
    expect(prompt).toContain("Mindestlohn-Gesetz");
  });
});

describe("buildAnalysisPrompt", () => {
  it("includes all required fields", () => {
    const prompt = buildAnalysisPrompt("SPD", "Mindestlohn erhöhen", "Wahlprogramm S.8", "Mindestlohn-Gesetz", "ja", "ja");
    expect(prompt).toContain("SPD");
    expect(prompt).toContain("Mindestlohn erhöhen");
    expect(prompt).toContain("Wahlprogramm S.8");
  });
});
