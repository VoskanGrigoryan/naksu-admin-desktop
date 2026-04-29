import { describe, it, expect, beforeEach } from "vitest";
import { useUsersStore } from "./usersStore";
import type { User } from "./usersStore";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: crypto.randomUUID(),
    name: "Test User",
    email: "test@example.com",
    phone: "",
    birthday: null,
    memberships: [],
    enrollments: [],
    active: true,
    lastActive: null,
    role: "client",
    teachingDisciplines: [],
    ...overrides,
  };
}

// Reset store state before each test
beforeEach(() => {
  useUsersStore.setState({ users: [] });
});

describe("useUsersStore — setUsers", () => {
  it("replaces all users in the store", () => {
    const users = [makeUser({ id: "a" }), makeUser({ id: "b" })];
    useUsersStore.getState().setUsers(users);
    expect(useUsersStore.getState().users).toHaveLength(2);
    expect(useUsersStore.getState().users[0].id).toBe("a");
  });

  it("can reset to an empty array", () => {
    useUsersStore.getState().setUsers([makeUser()]);
    useUsersStore.getState().setUsers([]);
    expect(useUsersStore.getState().users).toHaveLength(0);
  });
});

describe("useUsersStore — addUser", () => {
  it("appends a user to the existing list", () => {
    const first = makeUser({ id: "first" });
    const second = makeUser({ id: "second" });
    useUsersStore.getState().setUsers([first]);
    useUsersStore.getState().addUser(second);
    const { users } = useUsersStore.getState();
    expect(users).toHaveLength(2);
    expect(users[1].id).toBe("second");
  });

  it("preserves existing users when adding", () => {
    const existing = makeUser({ id: "existing", name: "Existing" });
    useUsersStore.getState().setUsers([existing]);
    useUsersStore.getState().addUser(makeUser({ id: "new" }));
    expect(useUsersStore.getState().users[0].name).toBe("Existing");
  });
});

describe("useUsersStore — updateUser", () => {
  it("merges partial data onto the target user", () => {
    const user = makeUser({ id: "u1", name: "Original", active: true });
    useUsersStore.getState().setUsers([user]);
    useUsersStore.getState().updateUser("u1", { active: false });
    const updated = useUsersStore.getState().users.find((u) => u.id === "u1");
    expect(updated?.active).toBe(false);
    expect(updated?.name).toBe("Original");
  });

  it("does not affect other users in the list", () => {
    const u1 = makeUser({ id: "u1", name: "Alice" });
    const u2 = makeUser({ id: "u2", name: "Bob" });
    useUsersStore.getState().setUsers([u1, u2]);
    useUsersStore.getState().updateUser("u1", { name: "Alicia" });
    expect(useUsersStore.getState().users.find((u) => u.id === "u2")?.name).toBe("Bob");
  });

  it("updates role and teachingDisciplines correctly", () => {
    const user = makeUser({ id: "u1", role: "client", teachingDisciplines: [] });
    useUsersStore.getState().setUsers([user]);
    useUsersStore.getState().updateUser("u1", {
      role: "trainer",
      teachingDisciplines: ["boxeo", "muay_thai"],
    });
    const updated = useUsersStore.getState().users.find((u) => u.id === "u1");
    expect(updated?.role).toBe("trainer");
    expect(updated?.teachingDisciplines).toEqual(["boxeo", "muay_thai"]);
  });

  it("silently ignores an unknown id", () => {
    const user = makeUser({ id: "u1" });
    useUsersStore.getState().setUsers([user]);
    expect(() =>
      useUsersStore.getState().updateUser("non-existent", { name: "Ghost" })
    ).not.toThrow();
    expect(useUsersStore.getState().users[0].name).toBe("Test User");
  });
});
