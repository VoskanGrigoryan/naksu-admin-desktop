import type { User } from "../../store/usersStore";
import type { PaymentStatus } from "../../views/users/columns";

export function getPaymentStatus(user: User): PaymentStatus {
  if (!user.memberships.length) return "pending";

  const totalPaid = user.memberships.reduce(
    (acc, m) => acc + m.amountPaid,
    0,
  );

  const totalDue = user.memberships.reduce(
    (acc, m) => acc + (m.pricePerClass ?? 0) * m.totalClasses,
    0,
  );

  if (totalPaid >= totalDue) return "paid";
  if (totalPaid === 0) return "overdue";
  return "pending";
}
