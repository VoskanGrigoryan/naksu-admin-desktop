import {
  Modal,
  Stack,
  Title,
  Text,
  Group,
  ColorSwatch,
  Divider,
} from "@mantine/core";
import { useState, useEffect } from "react";
import CrearClaseForm from "./CrearClaseForm";
import CustomButton from "../../components/reusable/Button";
import { IconEdit, IconTrash, IconAlertTriangle } from "@tabler/icons-react";
import type { EventApi } from "@fullcalendar/core";
import type { CalendarEvent } from "../../types/calendar";

type EditModalProps = {
  opened: boolean;
  onClose: () => void;
  event?: CalendarEvent;
  onSubmit: (updated: Partial<CalendarEvent>) => void;
};

export const EditModal = ({
  opened,
  onClose,
  event,
  onSubmit,
}: EditModalProps) => {
  if (!event) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Modificar clase"
      centered
      withinPortal
    >
      <CrearClaseForm
        initialValues={event}
        onSubmit={(updated) => {
          onSubmit(updated);
          onClose();
        }}
      />
    </Modal>
  );
};

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const formatTime = (d: Date | null) =>
  d
    ? d.toLocaleTimeString("es", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    : "";

type ConfirmActionModalProps = {
  opened: boolean;
  onClose: () => void;
  event: EventApi | null;
  originalEvent?: CalendarEvent;
  onEdit: () => void;
  onDelete: (id: string) => void;
};

export const ConfirmActionModal = ({
  opened,
  onClose,
  event,
  originalEvent,
  onEdit,
  onDelete,
}: ConfirmActionModalProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!opened) setIsConfirming(false);
  }, [opened]);

  if (!event) return null;

  const formattedTitle = [event.title, event.extendedProps?.instructor]
    .filter(Boolean)
    .join(" - ");

  return (
    <Modal
      size="sm"
      opened={opened}
      onClose={onClose}
      title={
        <Title order={3} fw={500}>
          {formattedTitle}
        </Title>
      }
      centered
    >
      {!isConfirming ? (
        <Stack gap="md">
          <Stack gap={6}>
            <Group gap="xs">
              <ColorSwatch color={event.backgroundColor ?? "#228be6"} size={14} />
              <Text size="sm" c="dimmed">
                {formatTime(event.start)} – {formatTime(event.end)}
              </Text>
            </Group>

            {originalEvent?.daysOfWeek && originalEvent.daysOfWeek.length > 0 && (
              <Text size="sm" c="dimmed">
                {originalEvent.daysOfWeek.map((d) => DAY_NAMES[d]).join(", ")}
              </Text>
            )}
          </Stack>

          <Divider />

          <CustomButton
            variant="filled"
            onClick={onEdit}
            rightSection={<IconEdit size={20} stroke={1.5} />}
          >
            Modificar
          </CustomButton>

          <CustomButton
            variant="filled"
            color="red.5"
            onClick={() => setIsConfirming(true)}
            rightSection={<IconTrash size={20} stroke={1.5} />}
          >
            Eliminar
          </CustomButton>
        </Stack>
      ) : (
        <Stack gap="md">
          <Group gap="xs">
            <IconAlertTriangle size={18} color="var(--mantine-color-red-6)" />
            <Text fw={500}>¿Eliminar esta clase?</Text>
          </Group>

          <Text size="sm" c="dimmed">
            Esta acción no se puede deshacer.
          </Text>

          <Group grow>
            <CustomButton
              variant="outline"
              onClick={() => setIsConfirming(false)}
            >
              Cancelar
            </CustomButton>

            <CustomButton
              color="red.5"
              onClick={() => {
                onDelete(event.id);
                onClose();
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
