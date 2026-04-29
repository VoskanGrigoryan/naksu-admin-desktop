import { describe, it, expect } from "vitest";
import { userInfoSchema } from "./userInfoSchema";

const valid = {
  name: "Juan Pérez",
  email: "juan@gmail.com",
  phone: "11 4321 7788",
  birthday: new Date("1990-05-20"),
  dni: "38123456",
};

describe("userInfoSchema", () => {
  it("accepts a complete valid payload", () => {
    expect(() => userInfoSchema.parse(valid)).not.toThrow();
  });

  it("rejects an empty name", () => {
    const result = userInfoSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = userInfoSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("accepts a missing phone (optional field)", () => {
    const { phone: _phone, ...withoutPhone } = valid;
    expect(() => userInfoSchema.parse(withoutPhone)).not.toThrow();
  });

  it("accepts a missing DNI (optional field)", () => {
    const { dni: _dni, ...withoutDni } = valid;
    expect(() => userInfoSchema.parse(withoutDni)).not.toThrow();
  });

  it("accepts null birthday", () => {
    expect(() => userInfoSchema.parse({ ...valid, birthday: null })).not.toThrow();
  });

  it("rejects a non-Date birthday value", () => {
    const result = userInfoSchema.safeParse({ ...valid, birthday: "1990-05-20" });
    expect(result.success).toBe(false);
  });

  it("infers the correct output shape", () => {
    const parsed = userInfoSchema.parse(valid);
    expect(parsed).toMatchObject({
      name: "Juan Pérez",
      email: "juan@gmail.com",
    });
  });
});
