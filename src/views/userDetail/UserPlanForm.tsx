import { forwardRef, useImperativeHandle, useEffect, useState } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Badge,
  Divider,
  Group,
  NumberFormatter,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  membershipsSchema,
  type MembershipFormValues,
} from "../../schemas/userPlanSchema";
import { IconCirclePlusFilled, IconMoodEmpty, IconTrash } from "@tabler/icons-react";
import { classMeta } from "../users/columns";

type Props = {
  isEditing: boolean;
  disabledInputStyles: any;
  defaultValues: MembershipFormValues;
  onSubmit: (values: MembershipFormValues) => void;
  withPaper?: boolean;
};

export const allClassesAvailable = [
  { value: "muay_thai", label: "Muay Thai" },
  { value: "sipalki_do", label: "Sipalki Do" },
  { value: "competidores", label: "Competidores" },
  { value: "kick_boxing", label: "Kick Boxing" },
  { value: "boxeo", label: "Boxeo" },
  { value: "boxeo_comp_thai", label: "Boxeo Comp. Thai" },
  { value: "yoga", label: "Yoga" },
];

const UserPlanForm = forwardRef<UseFormReturn<MembershipFormValues>, Props>(
  ({ isEditing, defaultValues, onSubmit, withPaper = true }, ref) => {
    const form = useForm<MembershipFormValues>({
      resolver: zodResolver(membershipsSchema),
      defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "memberships",
    });

    const [selectedClass, setSelectedClass] = useState<string | null>(null);

    useImperativeHandle(ref, () => form);

    useEffect(() => {
      form.reset(defaultValues);
    }, [defaultValues]);

    useEffect(() => {
      if (!isEditing) form.reset(defaultValues);
    }, [isEditing]);

    const watchedMemberships = form.watch("memberships") ?? [];
    const selectedClassTypes = watchedMemberships.map((m) => m.classType);
    const availableOptions = allClassesAvailable.filter(
      (o) => !selectedClassTypes.includes(o.value as any),
    );

    const totalPaid = watchedMemberships.reduce(
      (acc, m) => acc + m.amountPaid,
      0,
    );
    const totalDue = watchedMemberships.reduce(
      (acc, m) => acc + (m.pricePerClass ?? 0) * m.totalClasses,
      0,
    );

    const inner = (
      <>
        {!isEditing ? (
            <Stack gap="sm">
            {fields.length === 0 ? (
              <Stack align="center" gap={6} py="md">
                <IconMoodEmpty size={32} stroke={1.5} color="var(--mantine-color-gray-4)" />
                <Text size="sm" c="dimmed">Sin membresías asignadas</Text>
              </Stack>
            ) : (
              <>
                {fields.map((field, index) => {
                  const m = watchedMemberships[index];
                  if (!m) return null;
                  const meta = classMeta[m.classType];
                  const due = (m.pricePerClass ?? 0) * m.totalClasses;
                  return (
                    <Group key={field.id} gap="sm" align="center">
                      <Badge
                        size="md"
                        radius="sm"
                        variant="light"
                        color={meta?.color ?? "gray"}
                        style={{ minWidth: 40, textAlign: "center" }}
                      >
                        {meta?.initials ?? "?"}
                      </Badge>
                      <Text size="sm" fw={500} style={{ minWidth: 145 }}>
                        {meta?.label ?? m.classType}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {m.totalClasses}{" "}
                        {m.totalClasses === 1 ? "clase" : "clases"}
                      </Text>
                      {(due > 0 || m.amountPaid > 0) && (
                        <>
                          <Text size="sm" c="dimmed">·</Text>
                          <Group gap={4}>
                            <NumberFormatter
                              prefix="$ "
                              value={m.amountPaid}
                              thousandSeparator
                              style={{
                                fontSize: "var(--mantine-font-size-sm)",
                              }}
                            />
                            {due > 0 && (
                              <Text size="sm" c="dimmed">
                                {" "}
                                /{" "}
                                <NumberFormatter
                                  prefix="$ "
                                  value={due}
                                  thousandSeparator
                                />
                              </Text>
                            )}
                          </Group>
                        </>
                      )}
                    </Group>
                  );
                })}

                {(totalPaid > 0 || totalDue > 0) && (
                  <>
                    <Divider mt="xs" />
                    <Group gap="xs">
                      <Text size="sm" c="dimmed">Total abonado:</Text>
                      <Text size="sm" fw={600}>
                        <NumberFormatter
                          prefix="$ "
                          value={totalPaid}
                          thousandSeparator
                        />
                      </Text>
                      {totalDue > 0 && (
                        <Text size="sm" c="dimmed">
                          de{" "}
                          <NumberFormatter
                            prefix="$ "
                            value={totalDue}
                            thousandSeparator
                          />
                        </Text>
                      )}
                    </Group>
                  </>
                )}
              </>
            )}
          </Stack>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Stack gap="sm">
              {fields.map((field, index) => {
                const classType = form.watch(
                  `memberships.${index}.classType`,
                );
                const meta = classMeta[classType];
                return (
                  <Group
                    key={field.id}
                    gap="sm"
                    align="center"
                    p="xs"
                    style={{
                      backgroundColor: "var(--mantine-color-gray-0)",
                      borderRadius: 8,
                      border: "1px solid var(--mantine-color-gray-2)",
                    }}
                  >
                    <Badge
                      size="lg"
                      radius="sm"
                      variant="light"
                      color={meta?.color ?? "gray"}
                      style={{ minWidth: 44 }}
                    >
                      {meta?.initials ?? "?"}
                    </Badge>
                    <Text size="sm" fw={500} style={{ minWidth: 130 }}>
                      {meta?.label ?? classType}
                    </Text>

                    <Group gap={6} align="center">
                      <Text size="xs" c="dimmed">Clases</Text>
                      <Controller
                        control={form.control}
                        name={`memberships.${index}.totalClasses`}
                        render={({ field }) => (
                          <NumberInput
                            style={{ width: 70 }}
                            allowNegative={false}
                            size="xs"
                            value={field.value}
                            onChange={(v) => field.onChange(v ?? 0)}
                          />
                        )}
                      />
                    </Group>

                    <Group gap={6} align="center">
                      <Text size="xs" c="dimmed">Abonado</Text>
                      <Controller
                        control={form.control}
                        name={`memberships.${index}.amountPaid`}
                        render={({ field }) => (
                          <NumberInput
                            style={{ width: 110 }}
                            allowNegative={false}
                            size="xs"
                            prefix="$ "
                            thousandSeparator=","
                            value={field.value}
                            onChange={(v) => field.onChange(v ?? 0)}
                          />
                        )}
                      />
                    </Group>

                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => remove(index)}
                    >
                      <IconTrash size={16} stroke={1.5} />
                    </ActionIcon>
                  </Group>
                );
              })}

              <Group mt="xs">
                <Select
                  size="sm"
                  placeholder="Seleccionar disciplina"
                  data={availableOptions}
                  value={selectedClass}
                  onChange={setSelectedClass}
                />
                <UnstyledButton
                  disabled={!selectedClass}
                  onClick={() => {
                    if (!selectedClass) return;
                    append({
                      classType: selectedClass as any,
                      totalClasses: 1,
                      amountPaid: 0,
                      pricePerClass: 0,
                    });
                    setSelectedClass(null);
                  }}
                >
                  <IconCirclePlusFilled
                    size={36}
                    style={{ paddingTop: 4 }}
                    color={
                      !selectedClass
                        ? "var(--mantine-color-gray-4)"
                        : "var(--mantine-color-green-6)"
                    }
                  />
                </UnstyledButton>
              </Group>
            </Stack>
          </form>
        )}
      </>
    );

    if (!withPaper) return inner;

    return (
      <Paper
        shadow={isEditing ? "xl" : "sm"}
        withBorder
        p="lg"
        style={{ transition: "box-shadow 150ms ease" }}
      >
        {inner}
      </Paper>
    );
  },
);

export default UserPlanForm;
