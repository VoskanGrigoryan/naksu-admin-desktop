import type { Membership } from "../../store/usersStore";

export type MembershipStatus = "active" | "expiring" | "expired";

export function getMembershipDue(m: Membership): number {
  return m.membershipType === "monthly"
    ? (m.monthlyPrice ?? 0)
    : (m.pricePerClass ?? 0) * m.totalClasses;
}

export function getMembershipStatus(m: Membership): MembershipStatus {
  const now = new Date();
  const end = new Date(m.endDate);
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 7) return "expiring";
  return "active";
}

export function getDaysUntilExpiry(m: Membership): number {
  const now = new Date();
  const end = new Date(m.endDate);
  return Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
}
