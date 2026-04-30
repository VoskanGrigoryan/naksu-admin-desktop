import { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
  Title,
  Alert,
} from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconUserPlus } from "@tabler/icons-react";
import { useUsersStore } from "../../store/usersStore";
import { useOccurrenceStore } from "../../store/occurrenceStore";
import { useCalendarStore } from "../../store/calendarStore";
import { getAvatarColor, getInitials } from "../users/columns";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

type Props = {
  opened: boolean;
  onClose: () => void;
  eventId: string;
  occurrenceDate: string; // YYYY-MM-DD
};

const AttendanceModal = ({ opened, onClose, eventId, occurrenceDate }: Props) => {
  const users = useUsersStore((s) => s.users);
  const events = useCalendarStore((s) => s.events);
  const getOccurrence = useOccurrenceStore((s) => s.getOccurrence);
  const upsertAttendees = useOccurrenceStore((s) => s.upsertAttendees);

  const event = useMemo(() => events.find((e) => e.id === eventId), [events, eventId]);
  const occurrence = useMemo(
    () => getOccurrence(eventId, occurrenceDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eventId, occurrenceDate, opened],
  );

  const enrolledUsers = useMemo(
    () => users.filter((u) => u.enrollments.some((e) => e.eventId === eventId)),
    [users, eventId],
  );

  const unenrolledUsers = useMemo(
    () => users.filter(
      (u) => (u.role === "client" || u.role === "both") &&
        !u.enrollments.some((e) => e.eventId === eventId),
    ),
    [users, eventId],
  );

  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    () => new Set(occurrence?.attendees ?? []),
  );
  const [showWalkIns, setShowWalkIns] = useState(false);

  // Reset checked state when modal opens
  const handleOpen = () => {
    const current = getOccurrence(eventId, occurrenceDate);
    setCheckedIds(new Set(current?.attendees ?? []));
    setShowWalkIns(false);
  };

  const toggle = (userId: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  const handleSave = () => {
    upsertAttendees(eventId, occurrenceDate, [...checkedIds]);
    onClose();
  };

  const formattedDate = useMemo(() => {
    const [y, m, d] = occurrenceDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return `${DAY_NAMES[date.getDay()]} ${d}/${m}/${y}`;
  }, [occurrenceDate]);

  const capacity = event?.maxCapacity;
  const presentCount = checkedIds.size;
  const overCapacity = capacity !== undefined && presentCount > capacity;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Stack gap={2}>
          <Title order={4} fw={600}>{event?.title ?? "Clase"} — Asistencia</Title>
          <Text size="sm" c="dimmed">{formattedDate}</Text>
        </Stack>
      }
      centered
      size="md"
      onAnimationEnd={() => opened && handleOpen()}
    >
      <Stack gap="md">
        {/* Capacity indicator */}
        {capacity !== undefined && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Capacidad</Text>
            <Badge color={overCapacity ? "red" : "green"} variant="light">
              {presentCount} / {capacity}
            </Badge>
          </Group>
        )}

        {overCapacity && (
          <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light" p="xs">
            Superando la capacidad máxima
          </Alert>
        )}

        {/* Enrolled students */}
        <div>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb="xs">
            Alumnos inscriptos ({enrolledUsers.length})
          </Text>
          {enrolledUsers.length === 0 ? (
            <Text size="sm" c="dimmed">Nadie inscripto en esta clase</Text>
          ) : (
            <ScrollArea.Autosize mah={260} type="hover" scrollbarSize={6}>
              <Stack gap="xs">
                {enrolledUsers.map((u) => (
                  <Group
                    key={u.id}
                    justify="space-between"
                    p="xs"
                    style={{
                      borderRadius: 8,
                      border: "1px solid var(--mantine-color-gray-2)",
                      backgroundColor: checkedIds.has(u.id)
                        ? "var(--mantine-color-green-0)"
                        : "var(--mantine-color-gray-0)",
                      cursor: "pointer",
                      transition: "background-color 120ms ease",
                    }}
                    onClick={() => toggle(u.id)}
                  >
                    <Group gap="sm">
                      <Avatar size={30} radius="xl" color={getAvatarColor(u.name)} variant="light">
                        {getInitials(u.name)}
                      </Avatar>
                      <Text size="sm" fw={500}>{u.name}</Text>
                    </Group>
                    <Checkbox
                      checked={checkedIds.has(u.id)}
                      onChange={() => toggle(u.id)}
                      color="green"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Group>
                ))}
              </Stack>
            </ScrollArea.Autosize>
          )}
        </div>

        {/* Walk-ins */}
        {unenrolledUsers.length > 0 && (
          <>
            <Divider />
            <Box>
              <Group justify="space-between" mb="xs">
                <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                  Presentes no inscriptos
                </Text>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  leftSection={<IconUserPlus size={13} />}
                  onClick={() => setShowWalkIns((v) => !v)}
                >
                  {showWalkIns ? "Ocultar" : "Agregar"}
                </Button>
              </Group>

              {showWalkIns && (
                <ScrollArea.Autosize mah={160} type="hover" scrollbarSize={6}>
                  <Stack gap="xs">
                    {unenrolledUsers.map((u) => (
                      <Group
                        key={u.id}
                        justify="space-between"
                        p="xs"
                        style={{
                          borderRadius: 8,
                          border: "1px solid var(--mantine-color-gray-2)",
                          backgroundColor: checkedIds.has(u.id)
                            ? "var(--mantine-color-blue-0)"
                            : "var(--mantine-color-gray-0)",
                          cursor: "pointer",
                        }}
                        onClick={() => toggle(u.id)}
                      >
                        <Group gap="sm">
                          <Avatar size={28} radius="xl" color={getAvatarColor(u.name)} variant="light">
                            {getInitials(u.name)}
                          </Avatar>
                          <Text size="sm">{u.name}</Text>
                        </Group>
                        <Checkbox
                          checked={checkedIds.has(u.id)}
                          onChange={() => toggle(u.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Group>
                    ))}
                  </Stack>
                </ScrollArea.Autosize>
              )}

              {/* Show checked walk-ins summary when collapsed */}
              {!showWalkIns && (() => {
                const walkins = unenrolledUsers.filter((u) => checkedIds.has(u.id));
                if (!walkins.length) return null;
                return (
                  <Group gap="xs" wrap="wrap">
                    {walkins.map((u) => (
                      <Badge key={u.id} size="sm" variant="light" color="blue">
                        {u.name}
                      </Badge>
                    ))}
                  </Group>
                );
              })()}
            </Box>
          </>
        )}

        <Divider />

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {presentCount} presente{presentCount !== 1 ? "s" : ""}
          </Text>
          <Group gap="xs">
            <Button variant="outline" color="gray" onClick={onClose}>Cancelar</Button>
            <Button
              leftSection={<IconCheck size={16} />}
              color="green"
              onClick={handleSave}
            >
              Guardar asistencia
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};

export default AttendanceModal;
