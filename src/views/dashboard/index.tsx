import { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Grid,
  Group,
  Modal,
  NumberFormatter,
  NumberInput,
  Paper,
  Progress,
  RingProgress,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Title,
  ThemeIcon,
  Alert,
} from "@mantine/core";
import {
  IconBarbell,
  IconBell,
  IconCalendarEvent,
  IconCircleCheck,
  IconClock,
  IconCurrencyDollar,
  IconMoodEmpty,
  IconUsers,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useComputedColorScheme } from "@mantine/core";
import MainLayout from "../../layouts/main/MainLayout";
import { useUsersStore, type ClassType, type PaymentMethod, type User } from "../../store/usersStore";
import { useCalendarStore } from "../../store/calendarStore";
import { getPaymentStatus, getAttentionContext } from "../../utils/helpers/getPaymentStatus";
import { getMembershipDue, getMembershipStatus } from "../../utils/helpers/membershipHelpers";
import { classMeta, getAvatarColor, getInitials, paymentConfig } from "../users/columns";

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function StatCard({
  icon, iconColor, label, value, sub,
}: {
  icon: React.ReactNode; iconColor: string; label: string;
  value: React.ReactNode; sub?: React.ReactNode;
}) {
  return (
    <Paper withBorder p="lg" radius="md" shadow="sm">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.5}>{label}</Text>
          <Text fw={700} size="xl" lh={1.2}>{value}</Text>
          {sub && <Text size="xs" c="dimmed">{sub}</Text>}
        </Stack>
        <ThemeIcon variant="light" color={iconColor} size={40} radius="md">{icon}</ThemeIcon>
      </Group>
    </Paper>
  );
}

// ── Quick Pay Modal ──────────────────────────────────────────────────────────

const methodOptions = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
  { value: "card", label: "Tarjeta" },
];

function QuickPayModal({
  user,
  onClose,
}: {
  user: User | null;
  onClose: () => void;
}) {
  const updateUser = useUsersStore((s) => s.updateUser);
  const addPaymentRecord = useUsersStore((s) => s.addPaymentRecord);

  const [amount, setAmount] = useState<number | string>("");
  const [method, setMethod] = useState<string | null>("cash");
  const [classType, setClassType] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const reset = () => { setAmount(""); setMethod("cash"); setClassType(null); setNote(""); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = () => {
    if (!user || !amount || !method) return;
    const num = Number(amount);
    if (isNaN(num) || num <= 0) return;

    // Add payment record
    addPaymentRecord(user.id, {
      id: crypto.randomUUID(),
      date: new Date(),
      amount: num,
      method: method as PaymentMethod,
      classType: classType as ClassType | undefined,
      note: note.trim() || undefined,
    });

    // Update amountPaid on the matching membership (or first unpaid one)
    const targetMembership = user.memberships.find(
      (m) => classType ? m.classType === classType : getMembershipDue(m) > m.amountPaid,
    );

    if (targetMembership) {
      const updatedMemberships = user.memberships.map((m) =>
        m === targetMembership ? { ...m, amountPaid: m.amountPaid + num } : m,
      );
      updateUser(user.id, { memberships: updatedMemberships });
    }

    handleClose();
  };

  if (!user) return null;

  const classOptions = user.memberships.map((m) => ({
    value: m.classType,
    label: classMeta[m.classType]?.label ?? m.classType,
  }));

  const totalDue = user.memberships.reduce((a, m) => a + getMembershipDue(m), 0);
  const totalPaid = user.memberships.reduce((a, m) => a + m.amountPaid, 0);
  const outstanding = Math.max(0, totalDue - totalPaid);

  return (
    <Modal
      opened={!!user}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <Avatar size={32} radius="xl" color={getAvatarColor(user.name)} variant="light">
            {getInitials(user.name)}
          </Avatar>
          <div>
            <Text fw={600} size="sm">{user.name}</Text>
            <Text size="xs" c="dimmed">Registrar pago</Text>
          </div>
        </Group>
      }
      centered
      size="sm"
    >
      <Stack gap="md">
        {outstanding > 0 && (
          <Alert color="orange" variant="light" p="xs">
            <Text size="xs">Saldo pendiente: <strong><NumberFormatter prefix="$ " value={outstanding} thousandSeparator /></strong></Text>
          </Alert>
        )}

        <NumberInput
          label="Monto"
          placeholder="0"
          prefix="$ "
          thousandSeparator=","
          min={1}
          value={amount}
          onChange={setAmount}
          allowNegative={false}
        />

        <Select
          label="Método de pago"
          data={methodOptions}
          value={method}
          onChange={setMethod}
        />

        {classOptions.length > 1 && (
          <Select
            label="Disciplina"
            placeholder="Seleccionar (opcional)"
            data={classOptions}
            value={classType}
            onChange={setClassType}
            clearable
          />
        )}

        <Textarea
          label="Nota"
          placeholder="Opcional"
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
          rows={2}
        />

        <Group justify="flex-end" gap="xs">
          <Button variant="outline" color="gray" onClick={handleClose}>Cancelar</Button>
          <Button
            color="green"
            disabled={!amount || Number(amount) <= 0 || !method}
            onClick={handleSubmit}
            leftSection={<IconCurrencyDollar size={16} />}
          >
            Registrar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const users = useUsersStore((s) => s.users);
  const events = useCalendarStore((s) => s.events);
  const colorScheme = useComputedColorScheme("light");
  const [quickPayUser, setQuickPayUser] = useState<User | null>(null);

  const rowStyles = useMemo(() => ({
    rowBg: colorScheme === "dark" ? "var(--mantine-color-dark-6)" : "var(--mantine-color-gray-0)",
    rowBorder: colorScheme === "dark" ? "1px solid var(--mantine-color-dark-4)" : "1px solid var(--mantine-color-gray-2)",
    todayBg: colorScheme === "dark" ? "rgba(29, 78, 216, 0.2)" : "var(--mantine-color-blue-0)",
    todayBorderColor: colorScheme === "dark" ? "var(--mantine-color-blue-7)" : "var(--mantine-color-blue-2)",
  }), [colorScheme]);

  const userStats = useMemo(() => {
    const payingUsers = users.filter((u) => (u.role ?? "client") !== "trainer");
    const trainerCount = users.filter((u) => u.role === "trainer" || u.role === "both").length;
    const activeCount = payingUsers.filter((u) => u.active).length;
    const totalClients = payingUsers.length;

    const totalCollected = payingUsers.reduce((acc, u) => acc + u.memberships.reduce((a, m) => a + m.amountPaid, 0), 0);
    const totalDue = payingUsers.reduce((acc, u) => acc + u.memberships.reduce((a, m) => a + getMembershipDue(m), 0), 0);
    const collectedPct = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

    const paidCount = payingUsers.filter((u) => getPaymentStatus(u) === "paid").length;
    const pendingCount = payingUsers.filter((u) => getPaymentStatus(u) === "pending").length;
    const overdueCount = payingUsers.filter((u) => getPaymentStatus(u) === "overdue").length;
    const paidPct = totalClients > 0 ? (paidCount / totalClients) * 100 : 0;
    const pendingPct = totalClients > 0 ? (pendingCount / totalClients) * 100 : 0;
    const overduePct = totalClients > 0 ? (overdueCount / totalClients) * 100 : 0;

    const disciplineMap: Record<string, number> = {};
    payingUsers.forEach((u) => {
      u.memberships.forEach((m) => { disciplineMap[m.classType] = (disciplineMap[m.classType] ?? 0) + 1; });
    });
    const sortedDisciplines = Object.entries(disciplineMap).sort((a, b) => b[1] - a[1]);
    const maxCount = sortedDisciplines[0]?.[1] ?? 1;
    const topDiscipline = sortedDisciplines[0];

    // Expiring memberships alert (within 7 days, not expired yet)
    const expiringUsers = payingUsers.filter((u) =>
      u.memberships.some((m) => getMembershipStatus(m) === "expiring"),
    );

    // Attention: unpaid OR expired memberships, sorted by urgency
    const attentionUsers = payingUsers
      .filter((u) => getPaymentStatus(u) !== "paid")
      .map((u) => ({ user: u, ctx: getAttentionContext(u) }))
      .sort((a, b) => {
        // overdue first, then by days left ascending (most urgent first)
        const orderStatus = { overdue: 0, pending: 1, paid: 2 } as const;
        const statusDiff = orderStatus[a.ctx.paymentStatus] - orderStatus[b.ctx.paymentStatus];
        if (statusDiff !== 0) return statusDiff;
        const aDay = a.ctx.daysLeft ?? 9999;
        const bDay = b.ctx.daysLeft ?? 9999;
        return aDay - bDay;
      });

    return {
      payingUsers, trainerCount, activeCount, totalClients,
      totalCollected, totalDue, collectedPct,
      paidCount, pendingCount, overdueCount,
      paidPct, pendingPct, overduePct,
      sortedDisciplines, maxCount, topDiscipline,
      attentionUsers, expiringUsers,
    };
  }, [users]);

  const calendarStats = useMemo(() => {
    const todayDow = new Date().getDay();
    const weekClasses = events
      .flatMap((e) => e.daysOfWeek.map((d) => ({ event: e, dow: d })))
      .sort((a, b) => {
        const aDiff = (a.dow - todayDow + 7) % 7;
        const bDiff = (b.dow - todayDow + 7) % 7;
        return aDiff !== bDiff ? aDiff - bDiff : a.event.startTime.localeCompare(b.event.startTime);
      });
    const classesThisWeek = events.reduce((acc, e) => acc + e.daysOfWeek.length, 0);
    return { todayDow, weekClasses, classesThisWeek };
  }, [events]);

  const {
    trainerCount, activeCount, totalClients,
    totalCollected, totalDue, collectedPct,
    paidCount, pendingCount, overdueCount,
    paidPct, pendingPct, overduePct,
    sortedDisciplines, maxCount, topDiscipline,
    attentionUsers, expiringUsers,
  } = userStats;

  const { todayDow, weekClasses, classesThisWeek } = calendarStats;
  const { rowBg, rowBorder, todayBg, todayBorderColor } = rowStyles;

  return (
    <MainLayout>
      <ScrollArea h="calc(100vh - 32px)" type="hover" scrollbarSize={6} offsetScrollbars styles={{ viewport: { paddingRight: 12 } }}>

        <Title order={3} fw={700} mb="lg">Panel principal</Title>

        {/* Expiry alert */}
        {expiringUsers.length > 0 && (
          <Alert
            icon={<IconBell size={16} />}
            color="yellow"
            variant="light"
            mb="md"
            title={`${expiringUsers.length} membresía${expiringUsers.length > 1 ? "s" : ""} por vencer`}
          >
            <Text size="sm">
              {expiringUsers.map((u) => u.name).join(", ")} — vencen en los próximos 7 días.
            </Text>
          </Alert>
        )}

        {/* KPI cards */}
        <SimpleGrid cols={4} spacing="md">
          <StatCard
            icon={<IconUsers size={20} stroke={1.5} />}
            iconColor="blue"
            label="Clientes activos"
            value={`${activeCount} / ${totalClients}`}
            sub={`${totalClients - activeCount} inactivo${totalClients - activeCount !== 1 ? "s" : ""}`}
          />
          <StatCard
            icon={<IconCurrencyDollar size={20} stroke={1.5} />}
            iconColor="green"
            label="Ingresos recaudados"
            value={<NumberFormatter prefix="$ " value={totalCollected} thousandSeparator />}
            sub={
              <Group gap={4}>
                <Text size="xs" c="dimmed">{collectedPct}% de</Text>
                <NumberFormatter prefix="$ " value={totalDue} thousandSeparator style={{ fontSize: "var(--mantine-font-size-xs)", color: "var(--mantine-color-dimmed)" }} />
              </Group>
            }
          />
          <StatCard
            icon={<IconBarbell size={20} stroke={1.5} />}
            iconColor="violet"
            label="Disciplina más popular"
            value={topDiscipline ? (classMeta[topDiscipline[0]]?.label ?? topDiscipline[0]) : "—"}
            sub={topDiscipline ? `${topDiscipline[1]} alumno${topDiscipline[1] !== 1 ? "s" : ""}` : undefined}
          />
          <StatCard
            icon={<IconCalendarEvent size={20} stroke={1.5} />}
            iconColor="orange"
            label="Clases esta semana"
            value={classesThisWeek}
            sub={`${trainerCount} entrenador${trainerCount !== 1 ? "es" : ""} activo${trainerCount !== 1 ? "s" : ""}`}
          />
        </SimpleGrid>

        {/* Middle row */}
        <Grid mt="md" gutter="md">
          <Grid.Col span={8}>
            <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
              <Title order={4} fw={600} mb="md">Alumnos por disciplina</Title>
              {sortedDisciplines.length === 0 ? (
                <Stack align="center" gap={6} py="lg">
                  <IconMoodEmpty size={32} stroke={1.5} color="var(--mantine-color-gray-4)" />
                  <Text size="sm" c="dimmed">Sin datos</Text>
                </Stack>
              ) : (
                <Stack gap="sm">
                  {sortedDisciplines.map(([type, count]) => {
                    const meta = classMeta[type];
                    return (
                      <Group key={type} gap="sm" align="center">
                        <Badge size="md" radius="sm" variant="light" color={meta?.color ?? "gray"} w={44} style={{ flexShrink: 0, textAlign: "center" }}>
                          {meta?.initials ?? "?"}
                        </Badge>
                        <Text size="sm" fw={500} w={160} style={{ flexShrink: 0 }}>{meta?.label ?? type}</Text>
                        <Box style={{ flex: 1 }}>
                          <Progress value={(count / maxCount) * 100} color={meta?.color ?? "blue"} size="md" radius="xl" />
                        </Box>
                        <Text size="sm" c="dimmed" w={24} ta="right" style={{ flexShrink: 0 }}>{count}</Text>
                      </Group>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </Grid.Col>

          <Grid.Col span={4}>
            <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
              <Title order={4} fw={600} mb="md">Estado de pagos</Title>
              <Stack align="center" gap="md">
                <RingProgress
                  size={160} thickness={18} roundCaps
                  sections={[
                    { value: paidPct, color: "green", tooltip: `Abonado: ${paidCount}` },
                    { value: pendingPct, color: "yellow", tooltip: `Pendiente: ${pendingCount}` },
                    { value: overduePct, color: "red", tooltip: `Vencido: ${overdueCount}` },
                  ]}
                  label={
                    <Stack gap={2} align="center">
                      <Text fw={700} size="lg" lh={1}>{totalClients}</Text>
                      <Text size="xs" c="dimmed">clientes</Text>
                    </Stack>
                  }
                />
                <Stack gap="xs" w="100%">
                  {[
                    { label: "Abonado", count: paidCount, color: "green" },
                    { label: "Pendiente", count: pendingCount, color: "yellow" },
                    { label: "Vencido", count: overdueCount, color: "red" },
                  ].map(({ label, count, color }) => (
                    <Group key={label} justify="space-between">
                      <Group gap="xs">
                        <Box w={10} h={10} style={{ borderRadius: "50%", backgroundColor: `var(--mantine-color-${color}-6)`, flexShrink: 0 }} />
                        <Text size="sm">{label}</Text>
                      </Group>
                      <Text size="sm" fw={600}>{count}</Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Bottom row */}
        <Grid mt="md" gutter="md" mb={8}>
          {/* Attention list */}
          <Grid.Col span={6}>
            <Paper withBorder p="lg" radius="md" shadow="sm">
              <Group gap="xs" mb="md">
                <ThemeIcon variant="light" color="red" size={28} radius="md">
                  <IconAlertTriangle size={16} stroke={1.5} />
                </ThemeIcon>
                <Title order={4} fw={600}>Requieren atención</Title>
              </Group>

              {attentionUsers.length === 0 ? (
                <Stack align="center" gap={6} py="md">
                  <IconCircleCheck size={32} stroke={1.5} color="var(--mantine-color-green-5)" />
                  <Text size="sm" c="dimmed">Todos los clientes están al día</Text>
                </Stack>
              ) : (
                <ScrollArea.Autosize mah={240} type="hover" scrollbarSize={6} offsetScrollbars>
                  <Stack gap="xs">
                    {attentionUsers.map(({ user, ctx }) => {
                      const cfg = paymentConfig[ctx.paymentStatus];
                      const daysText = ctx.daysLeft === null
                        ? null
                        : ctx.daysLeft < 0
                          ? `Venció hace ${Math.abs(ctx.daysLeft)}d`
                          : ctx.daysLeft === 0
                            ? "Vence hoy"
                            : `Vence en ${ctx.daysLeft}d`;

                      return (
                        <Group
                          key={user.id}
                          justify="space-between"
                          p="xs"
                          style={{
                            backgroundColor: rowBg,
                            borderRadius: 8,
                            border: rowBorder,
                            cursor: "pointer",
                          }}
                          onClick={() => setQuickPayUser(user)}
                        >
                          <Group gap="sm">
                            <Avatar size={30} radius="xl" color={getAvatarColor(user.name)} variant="light">
                              {getInitials(user.name)}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>{user.name}</Text>
                              <Group gap={4}>
                                <Badge size="xs" variant="dot" color={cfg.color}>{cfg.label}</Badge>
                                {daysText && (
                                  <Text size="xs" c="dimmed">{daysText}</Text>
                                )}
                              </Group>
                            </div>
                          </Group>
                          <Stack gap={2} align="flex-end">
                            {ctx.outstanding > 0 && (
                              <Text size="sm" fw={500} c="red.6">
                                <NumberFormatter prefix="$ " value={ctx.outstanding} thousandSeparator />
                              </Text>
                            )}
                            <Text size="xs" c="dimmed">Registrar pago →</Text>
                          </Stack>
                        </Group>
                      );
                    })}
                  </Stack>
                </ScrollArea.Autosize>
              )}
            </Paper>
          </Grid.Col>

          {/* Upcoming classes */}
          <Grid.Col span={6}>
            <Paper withBorder p="lg" radius="md" shadow="sm">
              <Group gap="xs" mb="md">
                <ThemeIcon variant="light" color="blue" size={28} radius="md">
                  <IconClock size={16} stroke={1.5} />
                </ThemeIcon>
                <Title order={4} fw={600}>Clases de la semana</Title>
              </Group>
              {weekClasses.length === 0 ? (
                <Stack align="center" gap={6} py="md">
                  <IconMoodEmpty size={32} stroke={1.5} color="var(--mantine-color-gray-4)" />
                  <Text size="sm" c="dimmed">Sin clases programadas</Text>
                </Stack>
              ) : (
                <ScrollArea.Autosize mah={240} type="hover" scrollbarSize={6} offsetScrollbars>
                  <Stack gap={4}>
                    {weekClasses.map(({ event, dow }, i) => {
                      const isToday = dow === todayDow;
                      const prevDow = i > 0 ? weekClasses[i - 1].dow : null;
                      const showDayLabel = dow !== prevDow;
                      return (
                        <Box key={`${event.id}-${dow}`}>
                          {showDayLabel && (
                            <Text size="xs" fw={700} tt="uppercase" c={isToday ? "blue" : "dimmed"} mt={i > 0 ? "xs" : 0} mb={4}>
                              {isToday ? `Hoy · ${dayNames[dow]}` : dayNames[dow]}
                            </Text>
                          )}
                          <Group
                            justify="space-between"
                            align="center"
                            p="xs"
                            style={{
                              backgroundColor: isToday ? todayBg : rowBg,
                              borderRadius: 8,
                              border: `1px solid ${isToday ? todayBorderColor : (colorScheme === "dark" ? "var(--mantine-color-dark-4)" : "var(--mantine-color-gray-2)")}`,
                            }}
                          >
                            <Group gap="sm" align="center">
                              <Box w={10} h={10} style={{ borderRadius: "50%", backgroundColor: event.backgroundColor, flexShrink: 0 }} />
                              <Text size="sm" fw={500}>{event.title}</Text>
                              {event.extendedProps?.instructor && (
                                <Text size="sm" c="dimmed">{event.extendedProps.instructor}</Text>
                              )}
                            </Group>
                            <Group gap="xs" align="center">
                              {event.maxCapacity !== undefined && (() => {
                                const enrolled = users.filter((u) =>
                                  u.enrollments.some((e) => e.eventId === event.id),
                                ).length;
                                return (
                                  <Badge size="xs" variant="light" color={enrolled >= event.maxCapacity! ? "red" : "gray"}>
                                    {enrolled}/{event.maxCapacity}
                                  </Badge>
                                );
                              })()}
                              <Text size="xs" c="dimmed">
                                {event.startTime.slice(0, 5)} – {event.endTime.slice(0, 5)}
                              </Text>
                            </Group>
                          </Group>
                        </Box>
                      );
                    })}
                  </Stack>
                </ScrollArea.Autosize>
              )}
            </Paper>
          </Grid.Col>
        </Grid>

      </ScrollArea>

      <QuickPayModal user={quickPayUser} onClose={() => setQuickPayUser(null)} />
    </MainLayout>
  );
};

export default Dashboard;
