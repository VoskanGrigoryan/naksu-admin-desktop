import { describe, it, expect } from "vitest";
import { getPaymentStatus } from "./getPaymentStatus";
import type { User } from "../../store/usersStore";

function makeUser(memberships: User["memberships"]): User {
  return {
    id: "test",
    name: "Test User",
    email: "test@test.com",
    phone: "",
    birthday: null,
    memberships,
    enrollments: [],
    active: true,
    lastActive: null,
    role: "client",
    teachingDisciplines: [],
  };
}

describe("getPaymentStatus", () => {
  it("returns 'pending' when user has no memberships", () => {
    expect(getPaymentStatus(makeUser([]))).toBe("pending");
  });

  it("returns 'paid' when amountPaid equals total due", () => {
    const user = makeUser([
      { classType: "boxeo", totalClasses: 10, amountPaid: 10000, pricePerClass: 1000 },
    ]);
    expect(getPaymentStatus(user)).toBe("paid");
  });

  it("returns 'paid' when amountPaid exceeds total due", () => {
    const user = makeUser([
      { classType: "yoga", totalClasses: 5, amountPaid: 6000, pricePerClass: 1000 },
    ]);
    expect(getPaymentStatus(user)).toBe("paid");
  });

  it("returns 'overdue' when nothing has been paid", () => {
    const user = makeUser([
      { classType: "muay_thai", totalClasses: 12, amountPaid: 0, pricePerClass: 1000 },
    ]);
    expect(getPaymentStatus(user)).toBe("overdue");
  });

  it("returns 'pending' when partially paid", () => {
    const user = makeUser([
      { classType: "kick_boxing", totalClasses: 12, amountPaid: 6000, pricePerClass: 1000 },
    ]);
    expect(getPaymentStatus(user)).toBe("pending");
  });

  it("aggregates across multiple memberships — paid when sum matches", () => {
    const user = makeUser([
      { classType: "boxeo", totalClasses: 10, amountPaid: 10000, pricePerClass: 1000 },
      { classType: "yoga", totalClasses: 8, amountPaid: 8000, pricePerClass: 1000 },
    ]);
    expect(getPaymentStatus(user)).toBe("paid");
  });

  it("aggregates across multiple memberships — pending when under-paid", () => {
    const user = makeUser([
      { classType: "boxeo", totalClasses: 10, amountPaid: 10000, pricePerClass: 1000 },
      { classType: "yoga", totalClasses: 8, amountPaid: 4000, pricePerClass: 1000 },
    ]);
    expect(getPaymentStatus(user)).toBe("pending");
  });

  it("treats missing pricePerClass as zero — paid when nothing is owed", () => {
    const user = makeUser([
      { classType: "boxeo", totalClasses: 10, amountPaid: 0 },
    ]);
    // totalDue = 0 * 10 = 0, amountPaid = 0 → 0 >= 0 → paid
    expect(getPaymentStatus(user)).toBe("paid");
  });
});
