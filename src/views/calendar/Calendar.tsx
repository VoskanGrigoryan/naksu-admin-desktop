import { ActionIcon, Group, Paper, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import CustomButton from "../../components/reusable/Button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { useCalendarStore } from "../../store/calendarStore";
import { useMemo, useRef, useState } from "react";
import type { CalendarApi, EventApi } from "@fullcalendar/core";
import type { CalendarEvent } from "../../types/calendar";
import { ConfirmActionModal, EditModal } from "./Modals";

const Calendar = ({ events }: { events: CalendarEvent[] }) => {
  const calendarRef = useRef<FullCalendar | null>(null);

  const removeEvent = useCalendarStore((s) => s.removeEvent);
  const updateEvent = useCalendarStore((s) => s.updateEvent);

  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
  const [weekLabel, setWeekLabel] = useState("");

  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  const getApi = (): CalendarApi | undefined => calendarRef.current?.getApi();

  const originalEvent = useMemo(() => {
    if (!selectedEvent) return undefined;
    return events.find((e) => e.id === selectedEvent.id);
  }, [selectedEvent, events]);

  const handleCloseDetails = () => {
    setSelectedEvent(null);
    close();
  };

  const handlePrev = () => getApi()?.prev();
  const handleNext = () => getApi()?.next();
  const handleToday = () => getApi()?.today();

  return (
    <>
      <Group align="stretch" wrap="nowrap">
        <Paper
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "calc(90vh - 30px)",
          }}
          shadow="lg"
          p="md"
          withBorder
          radius="md"
        >
          <Group justify="space-between" mb="md">
            <div>
              <Title order={3}>Calendario semanal</Title>
              {weekLabel && (
                <Text size="sm" c="dimmed" mt={2}>
                  {weekLabel}
                </Text>
              )}
            </div>

            <Group>
              <ActionIcon variant="light" onClick={handlePrev}>
                <IconChevronLeft size={18} />
              </ActionIcon>

              <CustomButton
                size="compact-md"
                variant="light"
                fw={500}
                onClick={handleToday}
              >
                Semana actual
              </CustomButton>

              <ActionIcon variant="light" onClick={handleNext}>
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
            events={events}
            datesSet={(info) => {
              const end = new Date(info.end);
              end.setDate(end.getDate() - 1);
              const fmt = (d: Date) =>
                d.toLocaleDateString("es", { day: "numeric", month: "short" });
              setWeekLabel(
                `${fmt(info.start)} – ${fmt(end)} ${end.getFullYear()}`,
              );
            }}
            eventClick={(info) => {
              setSelectedEvent(info.event);
              open();
            }}
          />
        </Paper>
      </Group>

      <ConfirmActionModal
        opened={opened}
        onClose={handleCloseDetails}
        event={selectedEvent}
        originalEvent={originalEvent}
        onEdit={() => {
          close();
          openEdit();
        }}
        onDelete={(id) => removeEvent(id)}
      />

      <EditModal
        opened={editOpened}
        onClose={closeEdit}
        event={originalEvent}
        onSubmit={(updated) => {
          if (!originalEvent) return;
          updateEvent(originalEvent.id, { ...originalEvent, ...updated });
        }}
      />
    </>
  );
};

export default Calendar;
