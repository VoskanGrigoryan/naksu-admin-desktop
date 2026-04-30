# naksu-admin — Improvements Backlog

Things that need to be added, changed, or rethought. Items that have been built are marked done.

---

## Done

### ✅ Attendance tracking
`ClassOccurrence` model implemented. Per-date check-in list with enrolled member checkboxes, walk-in support, capacity warning. Attendance marked via `occurrenceStore.upsertAttendees`, which auto-increments/decrements `classesUsed` on the user.

### ✅ Membership expiry and usage counter
`startDate`, `endDate`, `classesUsed` added to `Membership`. Progress bar shows used/total classes. `getMembershipStatus` derives `active / expiring / expired`. Dashboard expiry alert banner surfaces memberships expiring within 7 days.

### ✅ Membership type distinction
`membershipType: "monthly" | "class_pack"` implemented. Form shows conditional fields per type. Payment due computed per type.

### ✅ Class capacity
`maxCapacity` added to `CalendarEvent`. Calendar event tiles show enrolled/capacity. Attendance modal shows capacity warning badge.

### ✅ Payment history log
`PaymentRecord[]` attached to each user. Payment History section in user detail shows full chronological log with method and discipline badges.

### ✅ Dashboard quick actions
Quick Pay modal on dashboard: mark a payment (amount, method, discipline, note) without leaving the dashboard. Attention list now links directly to user detail.

### ✅ Overdue context on the attention list
Temporal context shown: "Venció hace Xd" / "Vence en Xd". Sorted by urgency.

### ✅ Class cancellation (single occurrence)
Cancel/restore individual dates of a recurring class without deleting the entire series. Cancelled occurrences appear dimmed on the calendar.

### ✅ Routines & Diets stub views
Both views exist with "En desarrollo" UI showing planned features.

---

## Pending

### Trainer schedule view
Trainers have `teachingDisciplines` but no dedicated view showing their own schedule — which classes they're teaching, enrollment counts, substitution management. Low priority until there are multiple trainers using the system.

### Expiry and attendance alerts (push notifications)
- Membership expiring within N days → surface as notification, not just a dashboard banner
- Client hasn't attended in X days → flag proactively
Currently the dashboard shows the expiry banner but there's no persistent notification system or reminder mechanism.

### Waitlist
When a class is at capacity, enrolled members can't be added. No waitlist exists yet — if someone drops out, the spot just opens silently.

### Multi-cycle payment tracking
Currently `amountPaid` is a flat number on the membership. For monthly plans, there's no concept of "paid for March, not yet paid for April." Each billing cycle isn't tracked as a separate record — the payment log exists but the cycle logic doesn't.

### Attendance history queries
Data exists (occurrences with attendee arrays) but there's no UI to query it: "how many times did this client attend in April?" / "who came to Muay Thai last week?". This would be valuable for the user detail view and potentially a reports section.

### Reports / exports
No way to export anything to CSV or PDF. Useful for the gym owner to share data with an accountant or review monthly revenue.

---

## Nice to Have

### Routines — full implementation
Assign workout routines to specific clients. Blocks of training with weekly progression, sets, reps, notes. Exercise library.

### Diets — full implementation
Assign nutrition plans to clients. Food bank with macros. Weight tracking over time.

### Dark mode polish
Dark mode toggle exists and works functionally. Some component backgrounds and borders may need fine-tuning for full polish in dark mode.
