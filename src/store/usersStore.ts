import { create } from "zustand";

export type ClassType =
  | "muay_thai"
  | "sipalki_do"
  | "competidores"
  | "kick_boxing"
  | "boxeo"
  | "boxeo_comp_thai"
  | "yoga";

export type MembershipType = "monthly" | "class_pack";
export type PaymentMethod = "cash" | "transfer" | "card";

export type PaymentRecord = {
  id: string;
  date: Date;
  amount: number;
  method: PaymentMethod;
  classType?: ClassType;
  note?: string;
};

export type Membership = {
  classType: ClassType;
  membershipType: MembershipType;
  startDate: Date;
  endDate: Date;
  amountPaid: number;
  // Class pack
  totalClasses: number;
  classesUsed: number;
  pricePerClass?: number;
  // Monthly
  monthlyPrice?: number;
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
  paymentHistory: PaymentRecord[];
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
  incrementClassesUsed: (userId: string, classType: ClassType) => void;
  decrementClassesUsed: (userId: string, classType: ClassType) => void;
  addPaymentRecord: (userId: string, record: PaymentRecord) => void;
};

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, data) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    })),
  incrementClassesUsed: (userId, classType) =>
    set((state) => ({
      users: state.users.map((u) => {
        if (u.id !== userId) return u;
        return {
          ...u,
          memberships: u.memberships.map((m) =>
            m.classType === classType
              ? { ...m, classesUsed: m.classesUsed + 1 }
              : m,
          ),
        };
      }),
    })),
  decrementClassesUsed: (userId, classType) =>
    set((state) => ({
      users: state.users.map((u) => {
        if (u.id !== userId) return u;
        return {
          ...u,
          memberships: u.memberships.map((m) =>
            m.classType === classType
              ? { ...m, classesUsed: Math.max(0, m.classesUsed - 1) }
              : m,
          ),
        };
      }),
    })),
  addPaymentRecord: (userId, record) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId
          ? { ...u, paymentHistory: [record, ...u.paymentHistory] }
          : u,
      ),
    })),
}));
