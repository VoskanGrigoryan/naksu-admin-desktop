import { useMemo } from "react";
import {
  ActionIcon,
  Box,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMoodEmpty, IconPlus, IconTrash } from "@tabler/icons-react";
import { useCalendarStore } from "../../store/calendarStore";
import type { Enrollment } from "../../store/usersStore";
import CustomButton from "../../components/reusable/Button";
import { Title } from "@mantine/core";

const dayNames: Record<number, string> = {
  0: "Dom",
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
};

type Props = {
  enrollments: Enrollment[];
  isEditing: boolean;
  onAdd: (eventId: string) => void;
  onRemove: (enrollmentId: string) => void;
};

const EnrollmentsSection = ({
  enrollments,
  isEditing,
  onAdd,
  onRemove,
}: Props) => {
  const events = useCalendarStore((s) => s.events);
  const [modalOpened, { open, close }] = useDisclosure(false);

  const { enrolledRows, availableEvents } = useMemo(() => {
    const enrolledEventIds = new Set(enrollments.map((e) => e.eventId));
    const enrolledRows = enrollments
      .map((enrollment) => ({
        enrollment,
        event: events.find((e) => e.id === enrollment.eventId),
      }))
      .filter((x): x is { enrollment: Enrollment; event: NonNullable<typeof x.event> } =>
        x.event !== undefined,
      );
    const availableEvents = events.filter((e) => !enrolledEventIds.has(e.id));
    return { enrolledRows, availableEvents };
  }, [enrollments, events]);

  return (
    <>
      <Paper shadow="sm" withBorder p="lg">
        <Group justify="space-between" mb="md">
          <Title order={2} fw={500}>Inscripciones</Title>
          {isEditing && (
            <CustomButton
              rightSection={<IconPlus size={16} stroke={1.5} style={{ paddingBottom: 2 }} />}
              onClick={open}
            >
              Agregar clase
            </CustomButton>
          )}
        </Group>

        {enrolledRows.length === 0 ? (
          <Stack align="center" gap={6} py="md">
            <IconMoodEmpty size={32} stroke={1.5} color="var(--mantine-color-gray-4)" />
            <Text size="sm" c="dimmed">Sin inscripciones</Text>
          </Stack>
        ) : (
          <ScrollArea.Autosize mah={300} type="hover" scrollbarSize={6} offsetScrollbars>
          <Stack gap="xs">
            {enrolledRows.map(({ enrollment, event }) => {
              const days = event.daysOfWeek.map((d) => dayNames[d]).join(", ");
              const start = event.startTime.slice(0, 5);
              const end = event.endTime.slice(0, 5);
              return (
                <Group
                  key={enrollment.id}
                  justify="space-between"
                  align="center"
                  p="xs"
                  style={{
                    backgroundColor: "var(--mantine-color-gray-0)",
                    borderRadius: 8,
                    border: "1px solid var(--mantine-color-gray-2)",
                  }}
                >
                  <Group gap="sm" align="center">
                    <Box
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: event.backgroundColor,
                        flexShrink: 0,
                      }}
                    />
                    <Text size="sm" fw={500}>
                      {event.title}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {days}
                    </Text>
                    <Text size="sm" c="dimmed">·</Text>
                    <Text size="sm" c="dimmed">
                      {start} – {end}
                    </Text>
                    {event.extendedProps?.instructor && (
                      <>
                        <Text size="sm" c="dimmed">·</Text>
                        <Text size="sm" c="dimmed">
                          {event.extendedProps.instructor}
                        </Text>
                      </>
                    )}
                  </Group>

                  {isEditing && (
                    <Tooltip
                      label="Quitar inscripción"
                      withArrow
                      transitionProps={{ duration: 80 }}
                    >
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => onRemove(enrollment.id)}
                      >
                        <IconTrash size={14} stroke={1.5} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              );
            })}
          </Stack>
          </ScrollArea.Autosize>
        )}
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={close}
        title="Agregar inscripción"
        centered
        size="md"
      >
        {availableEvents.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="lg">
            {events.length === 0
              ? "No hay clases configuradas en el calendario."
              : "El usuario ya está inscripto en todas las clases disponibles."}
          </Text>
        ) : (
          <Stack gap="xs">
            {availableEvents.map((event) => {
              const days = event.daysOfWeek.map((d) => dayNames[d]).join(", ");
              const start = event.startTime.slice(0, 5);
              const end = event.endTime.slice(0, 5);
              return (
                <Paper
                  key={event.id}
                  withBorder
                  p="sm"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    onAdd(event.id);
                    close();
                  }}
                >
                  <Group gap="sm" align="center">
                    <Box
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: event.backgroundColor,
                        flexShrink: 0,
                      }}
                    />
                    <Stack gap={2}>
                      <Text size="sm" fw={500}>
                        {event.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {days} · {start} – {end}
                      </Text>
                      {event.extendedProps?.instructor && (
                        <Text size="xs" c="dimmed">
                          {event.extendedProps.instructor}
                        </Text>
                      )}
                    </Stack>
                  </Group>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Modal>
    </>
  );
};

export default EnrollmentsSection;
