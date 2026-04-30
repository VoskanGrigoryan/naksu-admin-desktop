import type { User } from "../../store/usersStore";
import type { PaymentStatus } from "../../views/users/columns";
import { getMembershipDue, getMembershipStatus } from "./membershipHelpers";

export function getPaymentStatus(user: User): PaymentStatus {
  if (!user.memberships.length) return "pending";

  const now = new Date();

  // Any membership that is expired AND underpaid → overdue
  const hasOverdue = user.memberships.some((m) => {
    const due = getMembershipDue(m);
    return due > 0 && m.amountPaid < due && new Date(m.endDate) < now;
  });
  if (hasOverdue) return "overdue";

  const totalPaid = user.memberships.reduce((acc, m) => acc + m.amountPaid, 0);
  const totalDue = user.memberships.reduce(
    (acc, m) => acc + getMembershipDue(m),
    0,
  );

  if (totalDue === 0) return "paid";
  if (totalPaid >= totalDue) return "paid";
  if (totalPaid === 0) return "overdue";
  return "pending";
}

export function getAttentionContext(user: User): {
  paymentStatus: PaymentStatus;
  membershipStatus: MembershipStatus | null;
  daysLeft: number | null;
  outstanding: number;
} {
  const paymentStatus = getPaymentStatus(user);
  const totalPaid = user.memberships.reduce((a, m) => a + m.amountPaid, 0);
  const totalDue = user.memberships.reduce((a, m) => a + getMembershipDue(m), 0);
  const outstanding = Math.max(0, totalDue - totalPaid);

  // Find the most urgent membership
  const sorted = [...user.memberships].sort((a, b) => {
    const aEnd = new Date(a.endDate).getTime();
    const bEnd = new Date(b.endDate).getTime();
    return aEnd - bEnd;
  });

  const first = sorted[0];
  if (!first) return { paymentStatus, membershipStatus: null, daysLeft: null, outstanding };

  const membershipStatus = getMembershipStatus(first);
  const daysLeft = Math.ceil(
    (new Date(first.endDate).getTime() - Date.now()) / 86_400_000,
  );

  return { paymentStatus, membershipStatus, daysLeft, outstanding };
}

type MembershipStatus = "active" | "expiring" | "expired";
