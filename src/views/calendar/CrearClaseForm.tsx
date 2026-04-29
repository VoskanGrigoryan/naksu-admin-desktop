import {
  Autocomplete,
  Button,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
  ColorInput,
  DEFAULT_THEME,
} from "@mantine/core";
import { DateInput, TimePicker } from "@mantine/dates";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CalendarEvent } from "../../types/calendar";
import { useCalendarStore } from "../../store/calendarStore";
import { useUsersStore } from "../../store/usersStore";
import { mockUsers } from "../../mocks/userTableData";
import { eventSchema } from "../../schemas/eventSchema";
import { basicColors, daysOfWeek } from "../../utils/constants/calendar";
import {
  mapEventToFormValues,
  mapFormToEvent,
} from "../../utils/mappers/calendarEvent.mapper";

type FormValues = z.output<typeof eventSchema>;

type Props = {
  onSubmit: (event: CalendarEvent) => void;
  initialValues?: CalendarEvent;
};

const defaultFormValues: FormValues = {
  activity: "",
  instructor: "",
  startTime: "",
  endTime: "",
  daysOfWeek: [],
  startDate: new Date(),
  endDate: null,
  color: DEFAULT_THEME.colors.blue[6],
};

const CrearClaseForm = ({ onSubmit, initialValues }: Props) => {
  const storeEvents = useCalendarStore((s) => s.events);
  const { users, setUsers } = useUsersStore();

  useEffect(() => {
    if (users.length === 0) setUsers(mockUsers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activitySuggestions = Array.from(
    new Set(storeEvents.map((e) => e.title).filter(Boolean)),
  );

  const trainerOptions = users
    .filter((u) => u.role === "trainer" || u.role === "both")
    .map((u) => ({ value: u.name, label: u.name }));

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(eventSchema) as any,
    defaultValues: initialValues
      ? mapEventToFormValues(initialValues)
      : defaultFormValues,
  });

  useEffect(() => {
    if (initialValues) {
      reset(mapEventToFormValues(initialValues));
    }
  }, [initialValues, reset]);

  const submit: SubmitHandler<FormValues> = (values) => {
    onSubmit(mapFormToEvent(values, initialValues?.id));
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack>
        <Controller
          name="activity"
          control={control}
          render={({ field }) => (
            <Autocomplete
              label="Actividad"
              placeholder="Ej. Muay Thai, Boxeo, etc"
              data={activitySuggestions}
              value={field.value}
              onChange={field.onChange}
              error={errors.activity?.message}
            />
          )}
        />

        <Controller
          name="instructor"
          control={control}
          render={({ field }) => (
            trainerOptions.length > 0 ? (
              <Select
                label="Instructor"
                placeholder="Seleccionar entrenador"
                data={trainerOptions}
                value={field.value || null}
                onChange={(v) => field.onChange(v ?? "")}
                clearable
                searchable
                error={errors.instructor?.message}
              />
            ) : (
              <Autocomplete
                label="Instructor"
                description={<Text size="xs" c="dimmed">No hay entrenadores registrados aún</Text>}
                data={[]}
                value={field.value}
                onChange={field.onChange}
                error={errors.instructor?.message}
              />
            )
          )}
        />

        <Group grow>
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <TimePicker
                label="Hora inicio"
                value={field.value}
                onChange={(v) => field.onChange(v ?? "")}
                format="24h"
                withSeconds={false}
                error={errors.startTime?.message}
              />
            )}
          />

          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <TimePicker
                label="Hora fin"
                value={field.value}
                onChange={(v) => field.onChange(v ?? "")}
                format="24h"
                withSeconds={false}
                error={errors.endTime?.message}
              />
            )}
          />
        </Group>

        <Controller
          name="daysOfWeek"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Repetir los días"
              data={daysOfWeek}
              value={field.value}
              onChange={(v) => field.onChange(v ?? [])}
              error={errors.daysOfWeek?.message}
            />
          )}
        />

        <Group grow>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label="Desde"
                value={field.value}
                onChange={(v) => field.onChange(v)}
                error={errors.startDate?.message}
              />
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label="Hasta"
                value={field.value}
                onChange={(v) => field.onChange(v)}
                error={errors.endDate?.message}
              />
            )}
          />
        </Group>

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <ColorInput
              label="Color de la clase"
              disallowInput
              withPicker={false}
              value={field.value}
              onChange={field.onChange}
              swatches={basicColors.map(
                (color) => DEFAULT_THEME.colors[color][5],
              )}
              error={errors.color?.message}
            />
          )}
        />

        <Button type="submit">
          {initialValues ? "Guardar cambios" : "Crear clase"}
        </Button>
      </Stack>
    </form>
  );
};

export default CrearClaseForm;
