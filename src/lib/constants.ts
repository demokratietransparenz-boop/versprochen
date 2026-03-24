import type { TopicCategory, TrafficLightColor } from "./types";

export const TOPIC_CATEGORIES: TopicCategory[] = [
  "Klimapolitik", "Sozialpolitik", "Wirtschaft", "Migration", "Bildung",
  "Gesundheit", "Sicherheit", "Digitales", "Außenpolitik", "Finanzen",
];

export const CONFIDENCE_THRESHOLD = 0.8;
export const DEVIATION_THRESHOLD = 0.5;

export const TRAFFIC_LIGHT_THRESHOLDS = {
  gruen: 70,
  gelb: 50,
} as const;

export const COLORS = {
  accent: "#1a56b8",
  logoRed: "#c41e3a",
  scoreGreen: "#2e7d32",
  scoreOrange: "#e65100",
  scoreRed: "#c62828",
  bgGreen: "#e8f5e9",
  bgOrange: "#fff3e0",
  bgRed: "#ffebee",
} as const;

export const PARTY_COLORS: Record<string, string> = {
  SPD: "#E3000F",
  "CDU/CSU": "#000000",
  "GRÜNE": "#64a12d",
  FDP: "#FFED00",
  AfD: "#009EE0",
  LINKE: "#BE3075",
  BSW: "#7D1E2F",
};

export function getTrafficLight(score: number): TrafficLightColor {
  if (score >= TRAFFIC_LIGHT_THRESHOLDS.gruen) return "gruen";
  if (score >= TRAFFIC_LIGHT_THRESHOLDS.gelb) return "gelb";
  return "rot";
}

export function getScoreColor(score: number): string {
  if (score >= TRAFFIC_LIGHT_THRESHOLDS.gruen) return COLORS.scoreGreen;
  if (score >= TRAFFIC_LIGHT_THRESHOLDS.gelb) return COLORS.scoreOrange;
  return COLORS.scoreRed;
}

export function getScoreBgColor(score: number): string {
  if (score >= TRAFFIC_LIGHT_THRESHOLDS.gruen) return COLORS.bgGreen;
  if (score >= TRAFFIC_LIGHT_THRESHOLDS.gelb) return COLORS.bgOrange;
  return COLORS.bgRed;
}
