import { forwardRef, useImperativeHandle } from "react";
import { Controller, useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Group, Paper, Stack, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
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

type Props = {
  isEditing: boolean;
  disabledInputStyles: any;
  defaultValues: UserInfoFormValues;
  onSubmit: (values: UserInfoFormValues) => void;
  withPaper?: boolean;
};

const UserInfoForm = forwardRef<UseFormReturn<UserInfoFormValues>, Props>(
  ({ isEditing, disabledInputStyles, defaultValues, onSubmit, withPaper = true }, ref) => {
    const form = useForm<UserInfoFormValues>({
      resolver: zodResolver(userInfoSchema),
      defaultValues,
    });

    useImperativeHandle(ref, () => form);

    const fields = (
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack>
          <Group gap="md" wrap="wrap">
            <Controller
              name="name"
              control={form.control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  disabled={!isEditing}
                  styles={disabledInputStyles}
                  style={{ minWidth: 250 }}
                  leftSection={<IconUser size={18} stroke={1.5} />}
                  size="md"
                  label="Nombre"
                />
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  disabled={!isEditing}
                  styles={disabledInputStyles}
                  style={{ minWidth: 250 }}
                  leftSection={<IconMail size={18} stroke={1.5} />}
                  size="md"
                  label="Email"
                />
              )}
            />

            <Controller
              name="phone"
              control={form.control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  disabled={!isEditing}
                  styles={disabledInputStyles}
                  style={{ minWidth: 250 }}
                  leftSection={<IconPhone size={18} stroke={1.5} />}
                  size="md"
                  label="Teléfono"
                />
              )}
            />

            <Controller
              name="birthday"
              control={form.control}
              render={({ field }) => (
                <DatePickerInput
                  {...field}
                  size="md"
                  disabled={!isEditing}
                  styles={disabledInputStyles}
                  style={{ minWidth: 250 }}
                  valueFormat="DD/MM/YYYY"
                  leftSection={<IconCalendar size={18} stroke={1.5} />}
                  leftSectionPointerEvents="none"
                  label="Fecha de nacimiento"
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
                  disabled={!isEditing}
                  styles={disabledInputStyles}
                  style={{ minWidth: 250 }}
                  leftSection={<IconId size={18} stroke={1.5} />}
                  size="md"
                  label="DNI"
                />
              )}
            />
          </Group>
        </Stack>
      </form>
    );

    if (!withPaper) return fields;

    return (
      <Paper
        shadow={isEditing ? "lg" : "sm"}
        withBorder
        p="lg"
        style={{ transition: "box-shadow 150ms ease" }}
      >
        {fields}
      </Paper>
    );
  },
);

export default UserInfoForm;
