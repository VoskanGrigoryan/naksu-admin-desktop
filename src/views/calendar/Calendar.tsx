import { ActionIcon, Badge, Box, Group, Paper, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import CustomButton from "../../components/reusable/Button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { useCalendarStore } from "../../store/calendarStore";
import { useOccurrenceStore } from "../../store/occurrenceStore";
import { useMemo, useRef, useState } from "react";
import type { CalendarApi, EventApi } from "@fullcalendar/core";
import type { CalendarEvent } from "../../types/calendar";
import { ConfirmActionModal, EditModal } from "./Modals";
import AttendanceModal from "./AttendanceModal";

type EnrichedEvent = CalendarEvent & {
  enrolledCount?: number;
};

const Calendar = ({ events }: { events: EnrichedEvent[] }) => {
  const calendarRef = useRef<FullCalendar | null>(null);
  const removeEvent = useCalendarStore((s) => s.removeEvent);
  const updateEvent = useCalendarStore((s) => s.updateEvent);
  const getOccurrence = useOccurrenceStore((s) => s.getOccurrence);

  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
  const [occurrenceDate, setOccurrenceDate] = useState("");
  const [weekLabel, setWeekLabel] = useState("");

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [attendanceOpened, { open: openAttendance, close: closeAttendance }] = useDisclosure(false);

  const getApi = (): CalendarApi | undefined => calendarRef.current?.getApi();

  const originalEvent = useMemo(
    () => (selectedEvent ? events.find((e) => e.id === selectedEvent.id) : undefined),
    [selectedEvent, events],
  );

  // Build cancelled dates set for visual override
  const { occurrences } = useOccurrenceStore();
  const cancelledDates = useMemo(() => {
    const set = new Set<string>();
    occurrences.filter((o) => o.cancelled).forEach((o) => set.add(`${o.eventId}:${o.date}`));
    return set;
  }, [occurrences]);

  // FC events with capacity + enrollment data in extendedProps
  const fcEvents = useMemo(
    () =>
      events.map((e) => ({
        ...e,
        extendedProps: {
          ...e.extendedProps,
          maxCapacity: e.maxCapacity,
          enrolledCount: e.enrolledCount ?? 0,
        },
      })),
    [events],
  );

  return (
    <>
      <Group align="stretch" wrap="nowrap">
        <Paper
          style={{ flex: 1, display: "flex", flexDirection: "column", height: "calc(90vh - 30px)" }}
          shadow="lg"
          p="md"
          withBorder
          radius="md"
        >
          <Group justify="space-between" mb="md">
            <div>
              <Title order={3}>Calendario semanal</Title>
              {weekLabel && <Text size="sm" c="dimmed" mt={2}>{weekLabel}</Text>}
            </div>
            <Group>
              <ActionIcon variant="light" onClick={() => getApi()?.prev()}>
                <IconChevronLeft size={18} />
              </ActionIcon>
              <CustomButton size="compact-md" variant="light" fw={500} onClick={() => getApi()?.today()}>
                Semana actual
              </CustomButton>
              <ActionIcon variant="light" onClick={() => getApi()?.next()}>
                <IconChevronRight size={18} />
              </ActionIcon>
            </Group>
          </Group>

          <FullCalendar
            ref={calendarRef}
            plugins={[timeGridPlugin, interactionPlugin]}
            locale={esLocale}
            initialView="timeGridWeek"
            headerToolbar={false}
            allDaySlot={false}
            slotMinTime="07:00:00"
            slotMaxTime="23:00:00"
            height="100%"
            editable
            selectable
            events={fcEvents}
            eventClassNames={(arg) => {
              const date = arg.event.start?.toISOString().slice(0, 10) ?? "";
              return cancelledDates.has(`${arg.event.id}:${date}`) ? ["fc-event-cancelled"] : [];
            }}
            eventContent={(arg) => {
              const { maxCapacity, enrolledCount, instructor } = arg.event.extendedProps;
              const date = arg.event.start?.toISOString().slice(0, 10) ?? "";
              const occurrence = getOccurrence(arg.event.id, date);
              const isCancelled = occurrence?.cancelled ?? false;
              const attendeeCount = occurrence?.attendees.length ?? 0;

              return (
                <Box
                  style={{
                    padding: "2px 4px",
                    opacity: isCancelled ? 0.45 : 1,
                    height: "100%",
                    overflow: "hidden",
                  }}
                >
                  <Text size="xs" fw={700} lineClamp={1}>{arg.event.title}</Text>
                  {instructor && (
                    <Text size="xs" style={{ opacity: 0.85 }} lineClamp={1}>{instructor}</Text>
                  )}
                  <Group gap={4} mt={2} wrap="nowrap">
                    {maxCapacity !== undefined && (
                      <Badge
                        size="xs"
                        variant="filled"
                        color={enrolledCount >= maxCapacity ? "red" : "white"}
                        style={{ color: enrolledCount >= maxCapacity ? "white" : "#333", padding: "0 4px" }}
                      >
                        {enrolledCount}/{maxCapacity}
                      </Badge>
                    )}
                    {attendeeCount > 0 && (
                      <Badge size="xs" variant="filled" color="green" style={{ padding: "0 4px" }}>
                        ✓ {attendeeCount}
                      </Badge>
                    )}
                    {isCancelled && (
                      <Badge size="xs" variant="filled" color="red" style={{ padding: "0 4px" }}>
                        Cancelada
                      </Badge>
                    )}
                  </Group>
                </Box>
              );
            }}
            datesSet={(info) => {
              const end = new Date(info.end);
              end.setDate(end.getDate() - 1);
              const fmt = (d: Date) =>
                d.toLocaleDateString("es", { day: "numeric", month: "short" });
              setWeekLabel(`${fmt(info.start)} – ${fmt(end)} ${end.getFullYear()}`);
            }}
            eventClick={(info) => {
              setSelectedEvent(info.event);
              setOccurrenceDate(info.event.start?.toISOString().slice(0, 10) ?? "");
              openDetails();
            }}
          />
        </Paper>
      </Group>

      <ConfirmActionModal
        opened={detailsOpened}
        onClose={closeDetails}
        event={selectedEvent}
        occurrenceDate={occurrenceDate}
        originalEvent={originalEvent}
        onEdit={() => { closeDetails(); openEdit(); }}
        onAttendance={() => { closeDetails(); openAttendance(); }}
        onDelete={(id) => removeEvent(id)}
      />

      <EditModal
        opened={editOpened}
        onClose={closeEdit}
        event={originalEvent}
        onSubmit={(updated) => {
          if (!originalEvent) return;
          updateEvent(originalEvent.id!, { ...originalEvent, ...updated });
        }}
      />

      {selectedEvent && (
        <AttendanceModal
          opened={attendanceOpened}
          onClose={closeAttendance}
          eventId={selectedEvent.id}
          occurrenceDate={occurrenceDate}
        />
      )}
    </>
  );
};

export default Calendar;
