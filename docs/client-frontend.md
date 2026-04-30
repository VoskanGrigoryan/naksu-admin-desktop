# naksu — Client Frontend

Web application used by gym members directly. The admin desktop app monitors and can manually override anything done here.

---

## Purpose

Give members a self-service portal so the gym owner/staff don't have to manually handle routine operations: registration, enrollment, payment, schedule browsing.

---

## Intended Features

### Account & Onboarding
- Register with email/password or Google (mirrors auth options in admin)
- Profile setup: name, phone, DNI, birthday
- Account linked to gym by invite code or QR code at front desk (prevents random signups from outside the gym)

### Membership & Payment
- View current membership plan (class type, classes purchased, classes remaining, expiry date)
- Add and manage payment methods (card, optionally cash/transfer with manual confirmation flow)
- Pay for or renew a membership plan directly
- View payment history

### Class Schedule
- Browse the full weekly recurring class schedule
- See class details: instructor, time, days, current enrollment vs capacity
- Enroll in a class (blocked if at capacity)
- Drop out of a class
- View own enrolled classes in a personal schedule view

### Attendance & History
- View personal attendance history (which classes attended, on which dates)
- See classes remaining on current membership updated in real time as attendance is logged

### Notifications
- Reminder before a class they're enrolled in
- Alert when membership is about to expire (e.g., 3 days out)
- Confirmation when a payment is processed
- Notice if a class is cancelled

---

## Relationship to Admin App

| Action | Client Frontend | Admin Desktop |
|---|---|---|
| Register / create account | Client does it | Admin can do it manually |
| Enroll in class | Client self-serves | Admin can enroll/remove manually |
| Pay for membership | Client pays via portal | Admin can mark as paid manually (cash etc.) |
| View schedule | Read-only | Admin creates/edits the schedule |
| Check in to class | Automatic on enrollment + attendance log | Admin marks attendance manually if needed |
| Cancel a class occurrence | N/A | Admin handles it |

The admin app is the source of truth. The client frontend reflects what the admin has configured and lets members handle the routine self-service operations that would otherwise require staff time.

---

## Tech (Proposed)
- **React** (web, not Tauri — needs to be accessible on any device)
- **Mantine** — keep consistent with admin for shared component logic if applicable
- Same backend/API as the admin app
- Mobile-first layout (most members will use their phone)
