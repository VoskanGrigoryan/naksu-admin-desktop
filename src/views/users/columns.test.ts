import { describe, it, expect } from "vitest";
import { getInitials, getAvatarColor, classMeta } from "./columns";

describe("getInitials", () => {
  it("returns two uppercase initials for a full name", () => {
    expect(getInitials("Juan Pérez")).toBe("JP");
  });

  it("returns one initial for a single-word name", () => {
    expect(getInitials("Carlos")).toBe("C");
  });

  it("only uses the first two words when name has more parts", () => {
    expect(getInitials("María de los Ángeles")).toBe("MD");
  });

  it("uppercases lowercase input", () => {
    expect(getInitials("ana gomez")).toBe("AG");
  });
});

describe("getAvatarColor", () => {
  it("returns a string for any name", () => {
    expect(typeof getAvatarColor("Test")).toBe("string");
  });

  it("is deterministic — same name always yields the same color", () => {
    expect(getAvatarColor("Juan Pérez")).toBe(getAvatarColor("Juan Pérez"));
  });

  it("returns different colors for different names (collision not guaranteed but typical)", () => {
    const colors = new Set(
      ["Ana", "Luis", "Carla", "Matías", "Sofía", "Diego", "Federico"].map(getAvatarColor)
    );
    // At least 3 distinct colours across 7 names
    expect(colors.size).toBeGreaterThanOrEqual(3);
  });

  it("never returns a value outside the allowed palette", () => {
    const palette = ["blue", "teal", "violet", "orange", "grape", "indigo", "cyan"];
    ["Alice", "Bob", "Charlie", "Dora", "Eve"].forEach((name) => {
      expect(palette).toContain(getAvatarColor(name));
    });
  });
});

describe("classMeta", () => {
  const expectedTypes = [
    "muay_thai",
    "sipalki_do",
    "competidores",
    "kick_boxing",
    "boxeo",
    "boxeo_comp_thai",
    "yoga",
  ] as const;

  it("has an entry for every supported class type", () => {
    expectedTypes.forEach((type) => {
      expect(classMeta[type]).toBeDefined();
    });
  });

  it("every entry has non-empty initials, label and color", () => {
    expectedTypes.forEach((type) => {
      const meta = classMeta[type];
      expect(meta.initials.length).toBeGreaterThan(0);
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.color.length).toBeGreaterThan(0);
    });
  });
});
