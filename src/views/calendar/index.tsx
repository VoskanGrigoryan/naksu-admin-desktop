import { Modal, Stack } from "@mantine/core";
import MainLayout from "../../layouts/main/MainLayout";
import { useDisclosure } from "@mantine/hooks";
import CrearClaseForm from "./CrearClaseForm";
import HeaderControls from "./Header";
import type { CalendarEvent } from "../../types/calendar";
import { useCalendarStore } from "../../store/calendarStore";
import { useEffect, useState } from "react";
import Calendar from "./Calendar";
import { mockCalendarEvents } from "../../mocks/calendarData";

const CalendarView = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const addEvent = useCalendarStore((s) => s.addEvent);
  const { events, setEvents } = useCalendarStore();

  useEffect(() => {
    if (events.length === 0) setEvents(mockCalendarEvents);
  }, []);

  const [filters, setFilters] = useState({
    instructors: [] as string[],
    activities: [] as string[],
  });

  const handleSubmit = (event: CalendarEvent) => {
    addEvent(event);
  };

  const filteredEvents = events.filter((e) => {
    const matchesInstructor =
      filters.instructors.length === 0 ||
      filters.instructors.includes(e.extendedProps?.instructor ?? "");
    const matchesActivity =
      filters.activities.length === 0 ||
      filters.activities.includes(e.title ?? "");
    return matchesInstructor && matchesActivity;
  });

  return (
    <MainLayout>
      <Stack gap="md" style={{ height: "100%" }}>
        <HeaderControls
          open={open}
          onFilter={setFilters}
          filters={filters}
          events={events}
        />
        <Calendar events={filteredEvents} />
      </Stack>

      <Modal opened={opened} onClose={close} title="Agregar clase" centered>
        <CrearClaseForm
          onSubmit={(event) => {
            handleSubmit(event);
            close();
          }}
        />
      </Modal>
    </MainLayout>
  );
};

export default CalendarView;
