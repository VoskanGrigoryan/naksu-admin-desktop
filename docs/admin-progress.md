# naksu-admin — What's Been Built

Desktop back-office application built with Tauri + React + TypeScript + Mantine UI.

---

## Stack

- **Tauri** — desktop shell (cross-platform native app)
- **React 18** — UI
- **TypeScript** — strict typing throughout
- **Mantine 8** — component library (core, dates, hooks, modals, notifications)
- **Zustand** — global state (users, calendar, occurrence, UI stores)
- **React Hook Form + Zod** — form handling and validation
- **FullCalendar** — weekly class schedule view
- **React Router** — client-side routing
- **mantine-datatable** — sortable, filterable user tables

---

## Views

### Dashboard (`/`)
- KPI cards: active clients, revenue collected vs due, top discipline, classes this week
- Discipline breakdown bar chart (clients per class type)
- Payment status ring (paid / pending / overdue)
- **Expiry alert banner**: highlights memberships expiring within 7 days
- **Attention list**: clients with unpaid or overdue memberships, with temporal context ("Venció hace Xd" / "Vence en Xd"), sorted by urgency
- **Quick Pay modal**: mark a payment directly from the dashboard (amount, method, discipline, optional note) without navigating to user detail
- Weekly class schedule with enrolled count vs capacity badges

### Users (`/users`)
- Tabbed view: Clients / Trainers
- Sortable, searchable table with role, membership badges, payment status, disciplines
- Create new user modal (name, email, phone, DNI, birthday, role)
- Reload data action

### User Detail (`/user/:id`)
- Full profile card with avatar, contact info, active status toggle
- Edit mode: inline form for personal info, role, teaching disciplines
- **Memberships section**: type badge (Mensual / Pack), date range, classes-used progress bar, amount paid vs due — add/edit/remove per membership
- **Enrollments section**: which recurring classes the user is enrolled in, add/remove with modal picker
- **Payment History section**: chronological log of all payments with method badge, discipline badge, amount, and optional note

### Calendar / Classes (`/classes`)
- Weekly calendar view (FullCalendar) showing all recurring class schedules
- Filter by instructor or activity
- **Event badges**: shows enrolled count / capacity on each event tile, dimmed style for cancelled occurrences
- Create class modal: activity, instructor, start/end time, days of week, date range, color, max capacity
- Edit existing class
- **Attendance modal**: per-date check-in list of enrolled members with checkboxes, walk-in support, capacity warning badge
- **Occurrence management**: cancel a single date of a recurring class (without deleting the entire series), restore it if cancelled
- Delete entire recurring event

### Auth (`/auth`)
- Login screen with email/password and Google auth option
- Auth layout separate from main app layout

### Routines (`/routines`)
- "En desarrollo" view with 4 planned feature cards (assignment, weekly progression, tracking, exercise library)

### Diets (`/diets`)
- "En desarrollo" view with 4 planned feature cards (individual plans, diet templates, weight tracking, food bank)

---

## Data Models

### User
```
id, name, email, phone, dni, birthday,
role: "client" | "trainer" | "both",
teachingDisciplines: ClassType[],
memberships: Membership[],
enrollments: Enrollment[],
paymentHistory: PaymentRecord[],
active: boolean,
lastActive: Date | null
```

### Membership
```
classType: ClassType,
membershipType: "monthly" | "class_pack",
startDate: Date,
endDate: Date,
totalClasses: number,
classesUsed: number,
amountPaid: number,
pricePerClass?: number,
monthlyPrice?: number
```

### PaymentRecord
```
id: string,
date: string,
amount: number,
method: "cash" | "transfer" | "card",
classType?: ClassType,
note?: string
```

### ClassOccurrence
```
id: string,
eventId: string,
date: string,        // YYYY-MM-DD
attendees: string[], // user ids
cancelled: boolean
```

### CalendarEvent (recurring)
```
id?, title, classType?,
instructor,
daysOfWeek: number[],
startTime, endTime,
startRecur, endRecur?,
backgroundColor, borderColor,
maxCapacity?: number
```

### Enrollment
```
id, eventId
```

### ClassTypes
`muay_thai | sipalki_do | competidores | kick_boxing | boxeo | boxeo_comp_thai | yoga`

---

## Business Logic

### Payment status
- `paid`: amountPaid >= total due across all memberships
- `pending`: partially paid
- `overdue`: nothing paid and something is owed
- Total due computed differently per type: `monthly` uses `monthlyPrice`, `class_pack` uses `pricePerClass × totalClasses`

### Membership status
- `active`: not expired
- `expiring`: expires within 7 days
- `expired`: past `endDate`

### Attendance / class tracking
- `occurrenceStore` manages per-date instances of recurring events
- Marking attendance calls `incrementClassesUsed` / `decrementClassesUsed` on the users store via cross-store `getState()` — keeps `classesUsed` always in sync

---

## Performance Work

- **Mock data centralized**: stores seeded once at app startup via `getState()` before React renders
- **Artificial delays removed**: eliminated fake loading screens from the Users view
- **Route lazy loading**: all views loaded with `React.lazy()` + `Suspense`
- **Background prefetching**: all route chunks prefetched after initial render
- **`useMemo` on Dashboard**: all derived state memoized
- **Zustand selectors**: components subscribe to specific slices of state
- **`useMemo` in forms**: instructor options, activity suggestions stabilized

---

## Build & Infra

- TypeScript strict build passes clean (`tsc -b && vite build`)
- Tauri production build produces `.deb`, `.rpm`, `.AppImage` (Linux)
- SSH configured for dual GitHub accounts via `github.com-personal` host alias
