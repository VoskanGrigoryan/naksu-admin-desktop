import { create } from "zustand";

export type ClassType =
  | "muay_thai"
  | "sipalki_do"
  | "competidores"
  | "kick_boxing"
  | "boxeo"
  | "boxeo_comp_thai"
  | "yoga";

export type Membership = {
  classType: ClassType;
  totalClasses: number;
  amountPaid: number;
  pricePerClass?: number;
};

export type Enrollment = {
  id: string;
  eventId: string;
};

export type UserRole = "client" | "trainer" | "both";

export type User = {
  id: string;
  name: string;
  phone: string;
  email: string;
  dni?: string;
  birthday: Date | null;
  memberships: Membership[];
  enrollments: Enrollment[];
  active: boolean;
  lastActive: Date | null;
  role: UserRole;
  teachingDisciplines: ClassType[];
};

type UsersState = {
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
};

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, data) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? { ...u, ...data } : u
      ),
    })),
}));
