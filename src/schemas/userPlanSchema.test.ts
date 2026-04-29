import { describe, it, expect } from "vitest";
import { membershipItemSchema, membershipsSchema, classTypeEnum } from "./userPlanSchema";

describe("classTypeEnum", () => {
  const validTypes = [
    "muay_thai",
    "sipalki_do",
    "competidores",
    "kick_boxing",
    "boxeo",
    "boxeo_comp_thai",
    "yoga",
  ] as const;

  it("accepts every supported class type", () => {
    validTypes.forEach((type) => {
      expect(() => classTypeEnum.parse(type)).not.toThrow();
    });
  });

  it("rejects an unknown class type", () => {
    expect(classTypeEnum.safeParse("pilates").success).toBe(false);
  });
});

describe("membershipItemSchema", () => {
  const valid = {
    classType: "boxeo",
    totalClasses: 12,
    amountPaid: 12000,
    pricePerClass: 1000,
  };

  it("accepts a complete valid membership", () => {
    expect(() => membershipItemSchema.parse(valid)).not.toThrow();
  });

  it("accepts a membership without pricePerClass (optional)", () => {
    const { pricePerClass: _p, ...withoutPrice } = valid;
    expect(() => membershipItemSchema.parse(withoutPrice)).not.toThrow();
  });

  it("rejects totalClasses of 0", () => {
    expect(membershipItemSchema.safeParse({ ...valid, totalClasses: 0 }).success).toBe(false);
  });

  it("rejects negative totalClasses", () => {
    expect(membershipItemSchema.safeParse({ ...valid, totalClasses: -5 }).success).toBe(false);
  });

  it("rejects a decimal totalClasses", () => {
    expect(membershipItemSchema.safeParse({ ...valid, totalClasses: 1.5 }).success).toBe(false);
  });

  it("rejects negative amountPaid", () => {
    expect(membershipItemSchema.safeParse({ ...valid, amountPaid: -100 }).success).toBe(false);
  });

  it("accepts amountPaid of zero", () => {
    expect(() => membershipItemSchema.parse({ ...valid, amountPaid: 0 })).not.toThrow();
  });

  it("rejects an invalid classType", () => {
    expect(membershipItemSchema.safeParse({ ...valid, classType: "zumba" }).success).toBe(false);
  });
});

describe("membershipsSchema", () => {
  it("accepts an empty membership array", () => {
    expect(() => membershipsSchema.parse({ memberships: [] })).not.toThrow();
  });

  it("accepts multiple valid memberships", () => {
    const payload = {
      memberships: [
        { classType: "boxeo", totalClasses: 10, amountPaid: 10000, pricePerClass: 1000 },
        { classType: "yoga", totalClasses: 8, amountPaid: 0 },
      ],
    };
    expect(() => membershipsSchema.parse(payload)).not.toThrow();
  });

  it("rejects if any membership item is invalid", () => {
    const result = membershipsSchema.safeParse({
      memberships: [
        { classType: "boxeo", totalClasses: 10, amountPaid: 10000 },
        { classType: "boxeo", totalClasses: 0, amountPaid: 0 }, // totalClasses: 0 is invalid
      ],
    });
    expect(result.success).toBe(false);
  });
});
