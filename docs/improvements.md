# naksu-admin — Business Logic Improvements

Things that need to be added, changed, or rethought before this can replace a spreadsheet and paper for real.

---

## Critical (blocks real usage)

### 1. Attendance tracking
**The problem:** The calendar has recurring schedules and enrollments (who signed up) but no record of who actually showed up on a specific date. The paper the gym uses is an attendance log. Right now that paper can't be replaced.

**What's needed:**
- A `ClassOccurrence` model: a specific instance of a recurring event on a specific date
- A check-in list per occurrence: which enrolled members attended
- Admin ability to mark attendance manually (tap a name, mark present/absent)
- History: "show me everyone who came to Muay Thai on April 22nd" / "show me how many times this client showed up this month"

This is the single most impactful missing feature.

---

### 2. Membership expiry and usage counter
**The problem:** The current `Membership` model has `totalClasses` and `amountPaid` but no start date, no end date, and no counter for classes used. You can't answer: when does this expire? How many classes do they have left?

**What's needed:**
- Add `startDate: Date` and `endDate: Date` to `Membership`
- Add `classesUsed: number` (incremented when attendance is marked)
- Derived: `classesRemaining = totalClasses - classesUsed`
- The "attention" list on the dashboard should factor in expiry — a membership expiring in 2 days is more urgent than one that's been expired for a month

---

### 3. Membership type distinction
**The problem:** Most gyms sell either a monthly plan (pay every month, attend as much as you want or up to a cap) or a class pack (buy 10/20/30 classes, use them within a period). The current model mixes both vaguely and doesn't distinguish between them.

**What's needed:**
- `membershipType: "monthly" | "class_pack"`
- **Monthly**: `billingCycleStart`, `billingCycleEnd`, `monthlyPrice`, optionally a class cap per month
- **Class pack**: `totalClasses`, `classesUsed`, `pricePerClass`, `expiryDate`
- Payment status logic changes depending on type (monthly = did they pay for this cycle; class pack = did they pay upfront)

---

### 4. Class capacity
**The problem:** Calendar events have no `maxCapacity` field. Without it the client frontend can't prevent overbooking and the admin has no visibility into how full a class is.

**What's needed:**
- Add `maxCapacity: number` to `CalendarEvent`
- Show enrolled count vs capacity in the calendar view and class list
- Block self-enrollment on the client frontend when full
- Optionally: waitlist

---

## Important (significantly improves daily use)

### 5. Payment history log
**The problem:** Currently only the current `amountPaid` is stored. There's no record of when someone paid, how much, or by what method. If a client disputes a payment, there's nothing to refer to.

**What's needed:**
- `PaymentRecord` model: `date`, `amount`, `method: "cash" | "transfer" | "card"`, `note?`
- Attached to the membership or the user
- Visible in user detail view
- Useful for the admin to manually log cash payments

---

### 6. Dashboard quick actions
**The problem:** The attention list shows who needs action but you can't do anything from there. You have to navigate to the user, find the membership, and update it manually. For a tool competing with a spreadsheet, acting from the dashboard is the whole point.

**What's needed:**
- Click a user in the attention list → open a quick panel or modal
- Mark as paid (with amount + method) without leaving the dashboard
- Navigate to full user detail in one click

---

### 7. Overdue context on the attention list
**The problem:** The attention list shows "pending" or "overdue" but gives no temporal context. How overdue? Since when?

**What's needed:**
- Show days since membership expired or payment was due
- Sort by most urgent (longest overdue first, then expiring soonest)
- Differentiate: "expires in 3 days" vs "expired 2 weeks ago, never renewed"

---

## Nice to Have (competitive differentiators)

### 8. Trainer schedule view
Trainers have `teachingDisciplines` but there's no view showing a trainer's own schedule — which classes they're teaching, how many students are enrolled, substitution management. Useful for gyms with multiple trainers.

### 9. Expiry and attendance alerts
- Membership expiring within N days → show in dashboard or send notification
- Client hasn't attended in X days → flag for follow-up
- These help the gym proactively retain members instead of only reacting when they stop showing up

### 10. Class cancellation (single occurrence)
Currently there's no way to cancel one specific occurrence of a recurring class (e.g., no Muay Thai this Tuesday due to a holiday) without deleting the entire recurring event. Need the ability to cancel individual dates and notify enrolled members.

### 11. Routines & Diets views
Already stubbed out in the app. Could be a meaningful differentiator over basic tools — assign workout routines or nutrition plans to specific clients. Lower priority than the attendance and payment fixes but worth building once the core is solid.

---

## Data Model Changes Summary

| Model | Current | Add |
|---|---|---|
| `Membership` | classType, totalClasses, amountPaid, pricePerClass | startDate, endDate, classesUsed, membershipType, billingCycle |
| `CalendarEvent` | recurring schedule | maxCapacity |
| *(new)* `ClassOccurrence` | — | eventId, date, attendees[] |
| *(new)* `PaymentRecord` | — | userId, date, amount, method, note |
