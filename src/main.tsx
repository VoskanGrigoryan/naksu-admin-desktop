import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider, createTheme, type MantineColorsTuple } from "@mantine/core";
import { useUsersStore } from "./store/usersStore";
import { useCalendarStore } from "./store/calendarStore";
import { useOccurrenceStore } from "./store/occurrenceStore";
import { mockUsers } from "./mocks/userTableData";
import { mockCalendarEvents } from "./mocks/calendarData";
import { mockOccurrences } from "./mocks/occurrenceData";

useUsersStore.getState().setUsers(mockUsers);
useCalendarStore.getState().setEvents(mockCalendarEvents);
useOccurrenceStore.getState().setOccurrences(mockOccurrences);
import { Notifications } from "@mantine/notifications";

const blue: MantineColorsTuple = [
  "#eff6ff",
  "#dbeafe",
  "#bfdbfe",
  "#93c5fd",
  "#60a5fa",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#1e40af",
  "#1e3a8a",
];

const theme = createTheme({
  colors: { blue },
  primaryColor: "blue",
  primaryShade: 6,
});
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-datatable/styles.layer.css";
import { DatesProvider } from "@mantine/dates";
import "dayjs/locale/es";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider
      defaultColorScheme="light"
      theme={{
        ...theme,
        components: {
          Input: {
            styles: {
              input: {
                paddingTop: 4,
              },
            },
          },
          Table: {
            styles: {
              th: {
                paddingBottom: 4,
              },
              td: {
                paddingBottom: 4,
              },
            },
          },
        },
      }}
    >
      <Notifications position="top-right" />
      <DatesProvider settings={{ locale: "es" }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DatesProvider>
    </MantineProvider>
  </StrictMode>,
);
