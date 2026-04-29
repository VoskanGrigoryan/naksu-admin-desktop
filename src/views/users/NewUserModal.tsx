import { useState } from "react";
import { Group, Modal, MultiSelect, SegmentedControl, Stack, Text, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  IconCalendar,
  IconId,
  IconMail,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";
import {
  userInfoSchema,
  type UserInfoFormValues,
} from "../../schemas/userInfoSchema";
import CustomButton from "../../components/reusable/Button";
import type { UserRole, ClassType } from "../../store/usersStore";
import { classMeta } from "./columns";

export type NewUserValues = UserInfoFormValues & {
  role: UserRole;
  teachingDisciplines: ClassType[];
};

const disciplineOptions = Object.entries(classMeta).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

type Props = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: NewUserValues) => void;
};

const NewUserModal = ({ opened, onClose, onSubmit }: Props) => {
  const form = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: { name: "", email: "", phone: "", birthday: null, dni: "" },
  });

  const [role, setRole] = useState<UserRole>("client");
  const [teachingDisciplines, setTeachingDisciplines] = useState<ClassType[]>([]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({ ...values, role, teachingDisciplines: role === "client" ? [] : teachingDisciplines });
    form.reset({ name: "", email: "", phone: "", birthday: null, dni: "" });
    setRole("client");
    setTeachingDisciplines([]);
    onClose();
  });

  const handleClose = () => {
    form.reset({ name: "", email: "", phone: "", birthday: null, dni: "" });
    setRole("client");
    setTeachingDisciplines([]);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Nuevo usuario"
      centered
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack>
          <Group>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  style={{ minWidth: 250 }}
                  leftSection={<IconUser size={18} stroke={1.5} />}
                  size="md"
                  label="Nombre"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  style={{ minWidth: 250 }}
                  leftSection={<IconMail size={18} stroke={1.5} />}
                  size="md"
                  label="Email"
                  error={fieldState.error?.message}
                />
              )}
            />
          </Group>
          <Group>
            <Controller
              name="phone"
              control={form.control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  style={{ minWidth: 250 }}
                  leftSection={<IconPhone size={18} stroke={1.5} />}
                  size="md"
                  label="Teléfono"
                />
              )}
            />
            <Controller
              name="dni"
              control={form.control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  value={field.value ?? ""}
                  style={{ minWidth: 250 }}
                  leftSection={<IconId size={18} stroke={1.5} />}
                  size="md"
                  label="DNI"
                />
              )}
            />
          </Group>
          <Group>
            <Controller
              name="birthday"
              control={form.control}
              render={({ field }) => (
                <DatePickerInput
                  {...field}
                  size="md"
                  style={{ minWidth: 250 }}
                  valueFormat="DD/MM/YYYY"
                  leftSection={<IconCalendar size={18} stroke={1.5} />}
                  leftSectionPointerEvents="none"
                  label="Fecha de nacimiento"
                />
              )}
            />
          </Group>

          <Stack gap={6}>
            <Text size="sm" fw={500}>Rol</Text>
            <SegmentedControl
              value={role}
              onChange={(v) => setRole(v as UserRole)}
              size="sm"
              radius="md"
              withItemsBorders
              data={[
                { value: "client", label: "Cliente" },
                { value: "trainer", label: "Entrenador" },
                { value: "both", label: "Ambos" },
              ]}
            />
          </Stack>

          {role !== "client" && (
            <MultiSelect
              label="Disciplinas que enseña"
              placeholder="Seleccionar disciplinas"
              data={disciplineOptions}
              value={teachingDisciplines}
              onChange={(v) => setTeachingDisciplines(v as ClassType[])}
            />
          )}

          <Group justify="flex-end" mt="xs">
            <CustomButton variant="outline" color="gray" onClick={handleClose} type="button">
              Cancelar
            </CustomButton>
            <CustomButton type="submit">Guardar</CustomButton>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default NewUserModal;
