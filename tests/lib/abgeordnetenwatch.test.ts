import { describe, it, expect } from "vitest";
import {
  parseParliaments,
  parseMembers,
  parseVotesResponse,
  parseVoteResultsResponse,
} from "@/lib/abgeordnetenwatch";

describe("parseParliaments", () => {
  it("parses parliament list response", () => {
    const raw = {
      data: [
        {
          id: 1,
          label: "Bundestag",
          current_project: { label: "Bundestag 2021-2025" },
        },
      ],
    };
    const result = parseParliaments(raw);
    expect(result).toEqual([
      { id: 1, name: "Bundestag", legislature: "Bundestag 2021-2025" },
    ]);
  });
});

describe("parseMembers", () => {
  it("parses member list response", () => {
    const raw = {
      data: [
        {
          id: 123,
          label: "Max Müller",
          party: { label: "SPD" },
          electoral_data: { constituency: { label: "Berlin-Mitte" } },
          abgeordnetenwatch_url: "https://www.abgeordnetenwatch.de/profile/max-mueller",
        },
      ],
    };
    const result = parseMembers(raw);
    expect(result[0].name).toBe("Max Müller");
    expect(result[0].party_name).toBe("SPD");
    expect(result[0].constituency).toBe("Berlin-Mitte");
    expect(result[0].abgeordnetenwatch_id).toBe("123");
  });
});

describe("parseVotesResponse", () => {
  it("parses vote list response", () => {
    const raw = {
      data: [
        {
          id: 456,
          label: "Klimaschutzgesetz",
          field_intro: "Beschreibung des Gesetzes",
          field_poll_date: "2026-03-15",
          field_legislature: { id: 1 },
        },
      ],
    };
    const result = parseVotesResponse(raw);
    expect(result[0].title).toBe("Klimaschutzgesetz");
    expect(result[0].date).toBe("2026-03-15");
  });
});

describe("parseVoteResultsResponse", () => {
  it("parses individual vote results", () => {
    const raw = {
      data: [
        { mandate: { id: 123 }, vote: "yes" },
        { mandate: { id: 124 }, vote: "no" },
        { mandate: { id: 125 }, vote: "abstain" },
        { mandate: { id: 126 }, vote: "no_show" },
      ],
    };
    const result = parseVoteResultsResponse(raw);
    expect(result[0].result).toBe("ja");
    expect(result[1].result).toBe("nein");
    expect(result[2].result).toBe("enthaltung");
    expect(result[3].result).toBe("abwesend");
  });
});
