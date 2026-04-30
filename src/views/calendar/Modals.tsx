import {
  Modal,
  Stack,
  Title,
  Text,
  Group,
  ColorSwatch,
  Divider,
  Badge,
} from "@mantine/core";
import { useState } from "react";
import CrearClaseForm from "./CrearClaseForm";
import CustomButton from "../../components/reusable/Button";
import {
  IconCalendarOff,
  IconClipboardCheck,
  IconEdit,
  IconTrash,
  IconAlertTriangle,
} from "@tabler/icons-react";
import type { EventApi } from "@fullcalendar/core";
import type { CalendarEvent } from "../../types/calendar";
import { useUsersStore } from "../../store/usersStore";
import { useOccurrenceStore } from "../../store/occurrenceStore";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const formatTime = (d: Date | null) =>
  d ? d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", hour12: false }) : "";

// ── Edit modal ──────────────────────────────────────────────────────────────

type EditModalProps = {
  opened: boolean;
  onClose: () => void;
  event?: CalendarEvent;
  onSubmit: (updated: Partial<CalendarEvent>) => void;
};

export const EditModal = ({ opened, onClose, event, onSubmit }: EditModalProps) => {
  if (!event) return null;
  return (
    <Modal opened={opened} onClose={onClose} title="Modificar clase" centered withinPortal>
      <CrearClaseForm
        initialValues={event}
        onSubmit={(updated) => { onSubmit(updated); onClose(); }}
      />
    </Modal>
  );
};

// ── Confirm / action modal ───────────────────────────────────────────────────

type ConfirmActionModalProps = {
  opened: boolean;
  onClose: () => void;
  event: EventApi | null;
  occurrenceDate: string; // YYYY-MM-DD
  originalEvent?: CalendarEvent;
  onEdit: () => void;
  onAttendance: () => void;
  onDelete: (id: string) => void;
};

export const ConfirmActionModal = ({
  opened,
  onClose,
  event,
  occurrenceDate,
  originalEvent,
  onEdit,
  onAttendance,
  onDelete,
}: ConfirmActionModalProps) => {
  const [view, setView] = useState<"actions" | "delete" | "cancel_occurrence">("actions");

  const users = useUsersStore((s) => s.users);
  const getOccurrence = useOccurrenceStore((s) => s.getOccurrence);
  const cancelOccurrence = useOccurrenceStore((s) => s.cancelOccurrence);
  const restoreOccurrence = useOccurrenceStore((s) => s.restoreOccurrence);

  const handleClose = () => { setView("actions"); onClose(); };

  if (!event) return null;

  const formattedTitle = [event.title, event.extendedProps?.instructor]
    .filter(Boolean)
    .join(" — ");

  const occurrence = getOccurrence(event.id, occurrenceDate);
  const isCancelled = occurrence?.cancelled ?? false;
  const attendeeCount = occurrence?.attendees.length ?? 0;
  const enrolledCount = users.filter((u) =>
    u.enrollments.some((e) => e.eventId === event.id),
  ).length;
  const capacity = originalEvent?.maxCapacity;

  const [y, m, d] = occurrenceDate.split("-").map(Number);
  const occDate = occurrenceDate ? new Date(y, m - 1, d) : null;
  const formattedDate = occDate
    ? `${DAY_NAMES[occDate.getDay()]} ${d}/${m}/${y}`
    : "";

  return (
    <Modal
      size="sm"
      opened={opened}
      onClose={handleClose}
      title={<Title order={3} fw={500}>{formattedTitle}</Title>}
      centered
    >
      {view === "actions" && (
        <Stack gap="md">
          <Stack gap={4}>
            <Group gap="xs">
              <ColorSwatch color={event.backgroundColor ?? "#228be6"} size={12} />
              <Text size="sm" c="dimmed">
                {formatTime(event.start)} – {formatTime(event.end)}
              </Text>
            </Group>
            {formattedDate && (
              <Text size="sm" c="dimmed">{formattedDate}</Text>
            )}
            {originalEvent?.daysOfWeek && originalEvent.daysOfWeek.length > 0 && (
              <Text size="sm" c="dimmed">
                {originalEvent.daysOfWeek.map((d) => DAY_NAMES[d]).join(", ")}
              </Text>
            )}
            <Group gap="xs" mt={4}>
              <Badge size="xs" variant="light" color="blue">
                {enrolledCount} inscriptos
              </Badge>
              {capacity !== undefined && (
                <Badge
                  size="xs"
                  variant="light"
                  color={enrolledCount >= capacity ? "red" : "gray"}
                >
                  Cap. {capacity}
                </Badge>
              )}
              {attendeeCount > 0 && (
                <Badge size="xs" variant="light" color="green">
                  {attendeeCount} presentes hoy
                </Badge>
              )}
              {isCancelled && (
                <Badge size="xs" variant="light" color="red">Cancelada</Badge>
              )}
            </Group>
          </Stack>

          <Divider />

          <CustomButton
            variant="filled"
            onClick={() => { onAttendance(); handleClose(); }}
            rightSection={<IconClipboardCheck size={18} stroke={1.5} />}
          >
            Tomar asistencia
          </CustomButton>

          <CustomButton
            variant="light"
            onClick={() => { onEdit(); handleClose(); }}
            rightSection={<IconEdit size={18} stroke={1.5} />}
          >
            Modificar clase
          </CustomButton>

          <CustomButton
            variant="subtle"
            color={isCancelled ? "green" : "orange"}
            onClick={() => setView("cancel_occurrence")}
            rightSection={<IconCalendarOff size={18} stroke={1.5} />}
          >
            {isCancelled ? "Restaurar esta fecha" : "Cancelar esta fecha"}
          </CustomButton>

          <CustomButton
            variant="subtle"
            color="red"
            onClick={() => setView("delete")}
            rightSection={<IconTrash size={18} stroke={1.5} />}
          >
            Eliminar clase completa
          </CustomButton>
        </Stack>
      )}

      {view === "delete" && (
        <Stack gap="md">
          <Group gap="xs">
            <IconAlertTriangle size={18} color="var(--mantine-color-red-6)" />
            <Text fw={500}>¿Eliminar esta clase completa?</Text>
          </Group>
          <Text size="sm" c="dimmed">
            Se eliminará el evento recurrente y toda su historia. Esta acción no se puede deshacer.
          </Text>
          <Group grow>
            <CustomButton variant="outline" onClick={() => setView("actions")}>Cancelar</CustomButton>
            <CustomButton color="red.5" onClick={() => { onDelete(event.id); handleClose(); }}>
              Confirmar
            </CustomButton>
          </Group>
        </Stack>
      )}

      {view === "cancel_occurrence" && (
        <Stack gap="md">
          <Group gap="xs">
            <IconCalendarOff size={18} color="var(--mantine-color-orange-6)" />
            <Text fw={500}>
              {isCancelled ? "¿Restaurar la clase del " : "¿Cancelar la clase del "}{formattedDate}?
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            {isCancelled
              ? "La clase volverá a aparecer como activa para esta fecha."
              : "Solo se cancela esta fecha. El evento recurrente sigue activo para otras fechas."}
          </Text>
          <Group grow>
            <CustomButton variant="outline" onClick={() => setView("actions")}>Volver</CustomButton>
            <CustomButton
              color={isCancelled ? "green" : "orange"}
              onClick={() => {
                isCancelled
                  ? restoreOccurrence(event.id, occurrenceDate)
                  : cancelOccurrence(event.id, occurrenceDate);
                handleClose();
              }}
            >
              Confirmar
            </CustomButton>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};
