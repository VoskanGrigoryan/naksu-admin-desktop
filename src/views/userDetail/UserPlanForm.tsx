import { forwardRef, useImperativeHandle, useEffect, useState, useMemo } from "react";
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
  Box,
  Divider,
  Group,
  NumberFormatter,
  NumberInput,
  Paper,
  Progress,
  Select,
  SegmentedControl,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { membershipsSchema, type MembershipFormValues } from "../../schemas/userPlanSchema";
import { IconCirclePlusFilled, IconMoodEmpty, IconTrash } from "@tabler/icons-react";
import { classMeta } from "../users/columns";
import { getMembershipDue, getMembershipStatus } from "../../utils/helpers/membershipHelpers";

const membershipStatusConfig = {
  active: { color: "green", label: "Activa" },
  expiring: { color: "yellow", label: "Vence pronto" },
  expired: { color: "red", label: "Vencida" },
};

const allClassesAvailable = [
  { value: "muay_thai", label: "Muay Thai" },
  { value: "sipalki_do", label: "Sipalki Do" },
  { value: "competidores", label: "Competidores" },
  { value: "kick_boxing", label: "Kick Boxing" },
  { value: "boxeo", label: "Boxeo" },
  { value: "boxeo_comp_thai", label: "Boxeo Comp. Thai" },
  { value: "yoga", label: "Yoga" },
];

type Props = {
  isEditing: boolean;
  disabledInputStyles: any;
  defaultValues: MembershipFormValues;
  onSubmit: (values: MembershipFormValues) => void;
  withPaper?: boolean;
};

const UserPlanForm = forwardRef<UseFormReturn<MembershipFormValues>, Props>(
  ({ isEditing, defaultValues, onSubmit, withPaper = true }, ref) => {
    const form = useForm<MembershipFormValues>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolver: zodResolver(membershipsSchema) as any,
      defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "memberships",
    });

    const [selectedClass, setSelectedClass] = useState<string | null>(null);

    useImperativeHandle(ref, () => form);

    useEffect(() => { form.reset(defaultValues); }, [defaultValues]);
    useEffect(() => { if (!isEditing) form.reset(defaultValues); }, [isEditing]);

    const watchedMemberships = form.watch("memberships") ?? [];

    const { totalPaid, totalDue } = useMemo(() => ({
      totalPaid: watchedMemberships.reduce((acc, m) => acc + m.amountPaid, 0),
      totalDue: watchedMemberships.reduce((acc, m) => acc + getMembershipDue(m as any), 0),
    }), [watchedMemberships]);

    const selectedClassTypes = watchedMemberships.map((m) => m.classType);
    const availableOptions = allClassesAvailable.filter(
      (o) => !selectedClassTypes.includes(o.value as any),
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
                  const due = getMembershipDue(m as any);
                  const status = getMembershipStatus(m as any);
                  const statusCfg = membershipStatusConfig[status];
                  const isClassPack = m.membershipType !== "monthly";
                  const usedPct = isClassPack && m.totalClasses > 0
                    ? (m.classesUsed / m.totalClasses) * 100
                    : 0;

                  return (
                    <Box
                      key={field.id}
                      p="sm"
                      style={{
                        border: "1px solid var(--mantine-color-gray-2)",
                        borderRadius: 8,
                        backgroundColor: "var(--mantine-color-gray-0)",
                      }}
                    >
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Group gap="sm" align="flex-start" wrap="nowrap">
                          <Badge size="md" radius="sm" variant="light" color={meta?.color ?? "gray"} style={{ minWidth: 40, flexShrink: 0 }}>
                            {meta?.initials ?? "?"}
                          </Badge>
                          <Stack gap={4}>
                            <Group gap="xs">
                              <Text size="sm" fw={600}>{meta?.label ?? m.classType}</Text>
                              <Badge size="xs" variant="outline" color="gray" radius="sm">
                                {m.membershipType === "monthly" ? "Mensual" : "Pack"}
                              </Badge>
                            </Group>
                            <Text size="xs" c="dimmed">
                              {new Date(m.startDate).toLocaleDateString("es-AR")} – {new Date(m.endDate).toLocaleDateString("es-AR")}
                            </Text>
                            {isClassPack && m.totalClasses > 0 && (
                              <Group gap="xs" align="center">
                                <Text size="xs" c="dimmed">{m.classesUsed}/{m.totalClasses} clases</Text>
                                <Box style={{ width: 80 }}>
                                  <Progress value={usedPct} size="xs" color={usedPct >= 90 ? "red" : "blue"} radius="xl" />
                                </Box>
                              </Group>
                            )}
                          </Stack>
                        </Group>
                        <Stack gap={4} align="flex-end">
                          <Badge size="xs" variant="dot" color={statusCfg.color}>{statusCfg.label}</Badge>
                          {due > 0 && (
                            <Text size="xs" c="dimmed">
                              <NumberFormatter prefix="$ " value={m.amountPaid} thousandSeparator />
                              {" / "}
                              <NumberFormatter prefix="$ " value={due} thousandSeparator />
                            </Text>
                          )}
                        </Stack>
                      </Group>
                    </Box>
                  );
                })}

                {(totalPaid > 0 || totalDue > 0) && (
                  <>
                    <Divider mt="xs" />
                    <Group gap="xs">
                      <Text size="sm" c="dimmed">Total abonado:</Text>
                      <Text size="sm" fw={600}><NumberFormatter prefix="$ " value={totalPaid} thousandSeparator /></Text>
                      {totalDue > 0 && (
                        <Text size="sm" c="dimmed">de <NumberFormatter prefix="$ " value={totalDue} thousandSeparator /></Text>
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
                const classType = form.watch(`memberships.${index}.classType`);
                const membershipType = form.watch(`memberships.${index}.membershipType`);
                const meta = classMeta[classType];
                const isMonthly = membershipType === "monthly";

                return (
                  <Box
                    key={field.id}
                    p="sm"
                    style={{
                      border: "1px solid var(--mantine-color-gray-2)",
                      borderRadius: 8,
                      backgroundColor: "var(--mantine-color-gray-0)",
                    }}
                  >
                    <Group gap="sm" align="flex-start" wrap="wrap">
                      <Badge size="lg" radius="sm" variant="light" color={meta?.color ?? "gray"} style={{ minWidth: 44, flexShrink: 0 }}>
                        {meta?.initials ?? "?"}
                      </Badge>
                      <Text size="sm" fw={500} style={{ minWidth: 130, paddingTop: 4 }}>
                        {meta?.label ?? classType}
                      </Text>

                      <Controller
                        control={form.control}
                        name={`memberships.${index}.membershipType`}
                        render={({ field }) => (
                          <SegmentedControl
                            size="xs"
                            value={field.value}
                            onChange={field.onChange}
                            data={[
                              { value: "class_pack", label: "Pack" },
                              { value: "monthly", label: "Mensual" },
                            ]}
                          />
                        )}
                      />

                      <Group gap={6} align="flex-start">
                        <Controller
                          control={form.control}
                          name={`memberships.${index}.startDate`}
                          render={({ field, fieldState }) => (
                            <DateInput
                              label="Inicio"
                              size="xs"
                              style={{ width: 120 }}
                              value={field.value ? new Date(field.value) : null}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          )}
                        />
                        <Controller
                          control={form.control}
                          name={`memberships.${index}.endDate`}
                          render={({ field, fieldState }) => (
                            <DateInput
                              label="Fin"
                              size="xs"
                              style={{ width: 120 }}
                              value={field.value ? new Date(field.value) : null}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          )}
                        />
                      </Group>

                      {!isMonthly && (
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
                      )}

                      <Group gap={6} align="center">
                        <Text size="xs" c="dimmed">Abonado</Text>
                        <Controller
                          control={form.control}
                          name={`memberships.${index}.amountPaid`}
                          render={({ field }) => (
                            <NumberInput
                              style={{ width: 120 }}
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

                      <ActionIcon variant="subtle" color="red" onClick={() => remove(index)} style={{ marginTop: 2 }}>
                        <IconTrash size={16} stroke={1.5} />
                      </ActionIcon>
                    </Group>
                  </Box>
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
                    const now = new Date();
                    const nextMonth = new Date(now);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    append({
                      classType: selectedClass as any,
                      membershipType: "class_pack",
                      startDate: now,
                      endDate: nextMonth,
                      totalClasses: 0,
                      classesUsed: 0,
                      amountPaid: 0,
                      pricePerClass: 0,
                    });
                    setSelectedClass(null);
                  }}
                >
                  <IconCirclePlusFilled
                    size={36}
                    style={{ paddingTop: 4 }}
                    color={!selectedClass ? "var(--mantine-color-gray-4)" : "var(--mantine-color-green-6)"}
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
      <Paper shadow={isEditing ? "xl" : "sm"} withBorder p="lg" style={{ transition: "box-shadow 150ms ease" }}>
        {inner}
      </Paper>
    );
  },
);

export default UserPlanForm;
