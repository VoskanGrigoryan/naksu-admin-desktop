import { Modal, Stack } from "@mantine/core";
import MainLayout from "../../layouts/main/MainLayout";
import { useDisclosure } from "@mantine/hooks";
import CrearClaseForm from "./CrearClaseForm";
import HeaderControls from "./Header";
import type { CalendarEvent } from "../../types/calendar";
import { useCalendarStore } from "../../store/calendarStore";
import { useUsersStore } from "../../store/usersStore";
import { useState, useMemo } from "react";
import Calendar from "./Calendar";

const CalendarView = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const addEvent = useCalendarStore((s) => s.addEvent);
  const events = useCalendarStore((s) => s.events);
  const users = useUsersStore((s) => s.users);

  const [filters, setFilters] = useState({
    instructors: [] as string[],
    activities: [] as string[],
  });

  const handleSubmit = (event: CalendarEvent) => addEvent(event);

  // Enrich events with live enrollment counts
  const enrichedEvents = useMemo(() => {
    return events.map((e) => ({
      ...e,
      enrolledCount: users.filter((u) =>
        u.enrollments.some((en) => en.eventId === e.id),
      ).length,
    }));
  }, [events, users]);

  const filteredEvents = useMemo(() => {
    return enrichedEvents.filter((e) => {
      const matchesInstructor =
        filters.instructors.length === 0 ||
        filters.instructors.includes(e.extendedProps?.instructor ?? "");
      const matchesActivity =
        filters.activities.length === 0 ||
        filters.activities.includes(e.title ?? "");
      return matchesInstructor && matchesActivity;
    });
  }, [enrichedEvents, filters]);

  return (
    <MainLayout>
      <Stack gap="md" style={{ height: "100%" }}>
        <HeaderControls open={open} onFilter={setFilters} filters={filters} events={events} />
        <Calendar events={filteredEvents} />
      </Stack>

      <Modal opened={opened} onClose={close} title="Agregar clase" centered>
        <CrearClaseForm
          onSubmit={(event) => { handleSubmit(event); close(); }}
        />
      </Modal>
    </MainLayout>
  );
};

export default CalendarView;
