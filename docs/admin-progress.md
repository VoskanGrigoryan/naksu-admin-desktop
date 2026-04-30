# naksu-admin — What's Been Built

Desktop back-office application built with Tauri + React + TypeScript + Mantine UI.

---

## Stack

- **Tauri** — desktop shell (cross-platform native app)
- **React 18** — UI
- **TypeScript** — strict typing throughout
- **Mantine 8** — component library (core, dates, hooks, modals, notifications)
- **Zustand** — global state (users store, calendar store, UI store)
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
- Attention list: clients with unpaid or overdue memberships, sorted by urgency
- Weekly class schedule starting from today

### Users (`/users`)
- Tabbed view: Clients / Trainers
- Sortable, searchable table with role, membership badges, payment status, disciplines
- Create new user modal (name, email, phone, DNI, birthday, role)
- Reload data action

### User Detail (`/user/:id`)
- Full profile card with avatar, contact info, active status toggle
- Edit mode: inline form for personal info, role, teaching disciplines
- Memberships section: class type, total classes, amount paid, price per class — add/edit/remove
- Enrollments section: which recurring classes the user is enrolled in, add/remove with modal picker

### Calendar / Classes (`/classes`)
- Weekly calendar view (FullCalendar) showing all recurring class schedules
- Filter by instructor or activity
- Create class modal: activity name, instructor, start/end time, days of week, date range, color
- Edit existing class (drag to move, click to edit)
- Delete class

### Auth (`/auth`)
- Login screen with email/password and Google auth option
- Auth layout separate from main app layout

### Routines & Diets (`/routines`, `/diets`)
- Views exist but are currently disabled — nav buttons visible but unclickable (opacity + pointer-events: none)

---

## Data Models

### User
```
id, name, email, phone, dni, birthday,
role: "client" | "trainer" | "both",
teachingDisciplines: ClassType[],
memberships: Membership[],
enrollments: Enrollment[],
active: boolean,
lastActive: Date | null
```

### Membership
```
classType: ClassType,
totalClasses: number,
amountPaid: number,
pricePerClass?: number
```

### CalendarEvent (recurring)
```
id, title, instructor,
daysOfWeek: number[],
startTime, endTime,
startDate, endDate,
backgroundColor
```

### Enrollment
```
id, eventId
```

### ClassTypes
`muay_thai | sipalki_do | competidores | kick_boxing | boxeo | boxeo_comp_thai | yoga`

---

## Performance Work

- **Mock data centralized**: stores seeded once at app startup via `getState()` before React renders — removed 6 separate per-component `useEffect` loaders
- **Artificial delays removed**: eliminated two 800ms `setTimeout` fake loading screens from the Users view
- **Route lazy loading**: all views loaded with `React.lazy()` + `Suspense` — FullCalendar (~500KB) only loads when navigating to `/classes`
- **Background prefetching**: all route chunks prefetched after initial render so navigation feels instant
- **`useMemo` on Dashboard**: all derived state (user stats, calendar stats, color scheme values) memoized — dashboard no longer recomputes 15+ values on every render
- **Zustand selectors**: components subscribe to specific slices of state instead of entire stores
- **`useMemo` in CrearClaseForm**: `activitySuggestions` and `trainerOptions` stabilized
- **EnrollmentsSection**: O(n) lookups consolidated into a single memoized pass

---

## Dev / Infra

- SSH configured for dual GitHub accounts (work: `ext-vogrigor_meli`, personal: `VoskanGrigoryan`) via `github.com-personal` host alias in `~/.ssh/config`
- Personal repo remote set to `git@github.com-personal:VoskanGrigoryan/naksu-admin-desktop.git`
