import { useEffect } from "react";
import {
  Badge,
  Box,
  Grid,
  Group,
  NumberFormatter,
  Paper,
  Progress,
  RingProgress,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBarbell,
  IconCalendarEvent,
  IconCircleCheck,
  IconClock,
  IconCurrencyDollar,
  IconMoodEmpty,
  IconUsers,
  IconAlertTriangle,
} from "@tabler/icons-react";

import MainLayout from "../../layouts/main/MainLayout";
import { useUsersStore } from "../../store/usersStore";
import { useCalendarStore } from "../../store/calendarStore";
import { mockUsers } from "../../mocks/userTableData";
import { mockCalendarEvents } from "../../mocks/calendarData";
import { getPaymentStatus } from "../../utils/helpers/getPaymentStatus";
import { classMeta, getAvatarColor, getInitials, paymentConfig } from "../users/columns";
import { Avatar } from "@mantine/core";

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function StatCard({
  icon,
  iconColor,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <Paper withBorder p="lg" radius="md" shadow="sm">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.5}>
            {label}
          </Text>
          <Text fw={700} size="xl" lh={1.2}>
            {value}
          </Text>
          {sub && <Text size="xs" c="dimmed">{sub}</Text>}
        </Stack>
        <ThemeIcon variant="light" color={iconColor} size={40} radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

const Dashboard = () => {
  const { users, setUsers } = useUsersStore();
  const { events, setEvents } = useCalendarStore();

  useEffect(() => {
    setUsers(mockUsers);
    setEvents(mockCalendarEvents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Paying users = clients + both (trainers don't pay)
  const payingUsers = users.filter((u) => (u.role ?? "client") !== "trainer");
  const trainerCount = users.filter((u) => u.role === "trainer" || u.role === "both").length;

  const activeCount = payingUsers.filter((u) => u.active).length;
  const totalClients = payingUsers.length;

  // Revenue
  const totalCollected = payingUsers.reduce(
    (acc, u) => acc + u.memberships.reduce((a, m) => a + m.amountPaid, 0),
    0,
  );
  const totalDue = payingUsers.reduce(
    (acc, u) =>
      acc + u.memberships.reduce((a, m) => a + (m.pricePerClass ?? 0) * m.totalClasses, 0),
    0,
  );
  const collectedPct = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

  // Payment status breakdown
  const paidCount = payingUsers.filter((u) => getPaymentStatus(u) === "paid").length;
  const pendingCount = payingUsers.filter((u) => getPaymentStatus(u) === "pending").length;
  const overdueCount = payingUsers.filter((u) => getPaymentStatus(u) === "overdue").length;
  const paidPct = totalClients > 0 ? (paidCount / totalClients) * 100 : 0;
  const pendingPct = totalClients > 0 ? (pendingCount / totalClients) * 100 : 0;
  const overduePct = totalClients > 0 ? (overdueCount / totalClients) * 100 : 0;

  // Discipline breakdown (by number of enrolled clients)
  const disciplineMap: Record<string, number> = {};
  payingUsers.forEach((u) => {
    u.memberships.forEach((m) => {
      disciplineMap[m.classType] = (disciplineMap[m.classType] ?? 0) + 1;
    });
  });
  const sortedDisciplines = Object.entries(disciplineMap).sort((a, b) => b[1] - a[1]);
  const maxCount = sortedDisciplines[0]?.[1] ?? 1;
  const topDiscipline = sortedDisciplines[0];

  // This week's classes — sorted starting from today
  const todayDow = new Date().getDay();
  const weekClasses = events
    .flatMap((e) => e.daysOfWeek.map((d) => ({ event: e, dow: d })))
    .sort((a, b) => {
      const aDiff = (a.dow - todayDow + 7) % 7;
      const bDiff = (b.dow - todayDow + 7) % 7;
      return aDiff !== bDiff ? aDiff - bDiff : a.event.startTime.localeCompare(b.event.startTime);
    });

  const classesThisWeek = events.reduce((acc, e) => acc + e.daysOfWeek.length, 0);

  // Attention needed: non-paid paying users
  const attentionUsers = payingUsers
    .filter((u) => getPaymentStatus(u) !== "paid")
    .sort((a, b) => {
      const order = { overdue: 0, pending: 1, paid: 2 } as const;
      return order[getPaymentStatus(a)] - order[getPaymentStatus(b)];
    });

  return (
    <MainLayout>
      <ScrollArea h="calc(100vh - 32px)" type="hover" scrollbarSize={6} offsetScrollbars styles={{ viewport: { paddingRight: 12 } }}>

        <Title order={3} fw={700} mb="lg">Panel principal</Title>

        {/* ── KPI stat cards ── */}
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

        {/* ── Middle row ── */}
        <Grid mt="md" gutter="md">
          {/* Discipline breakdown */}
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
                        <Badge
                          size="md"
                          radius="sm"
                          variant="light"
                          color={meta?.color ?? "gray"}
                          w={44}
                          style={{ flexShrink: 0, textAlign: "center" }}
                        >
                          {meta?.initials ?? "?"}
                        </Badge>
                        <Text size="sm" fw={500} w={160} style={{ flexShrink: 0 }}>
                          {meta?.label ?? type}
                        </Text>
                        <Box style={{ flex: 1 }}>
                          <Progress
                            value={(count / maxCount) * 100}
                            color={meta?.color ?? "blue"}
                            size="md"
                            radius="xl"
                          />
                        </Box>
                        <Text size="sm" c="dimmed" w={24} ta="right" style={{ flexShrink: 0 }}>
                          {count}
                        </Text>
                      </Group>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </Grid.Col>

          {/* Payment status ring */}
          <Grid.Col span={4}>
            <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
              <Title order={4} fw={600} mb="md">Estado de pagos</Title>
              <Stack align="center" gap="md">
                <RingProgress
                  size={160}
                  thickness={18}
                  roundCaps
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

        {/* ── Bottom row ── */}
        <Grid mt="md" gutter="md" mb={8}>
          {/* Attention needed */}
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
                    {attentionUsers.map((u) => {
                      const status = getPaymentStatus(u);
                      const cfg = paymentConfig[status];
                      const due = u.memberships.reduce((a, m) => a + (m.pricePerClass ?? 0) * m.totalClasses, 0);
                      const paid = u.memberships.reduce((a, m) => a + m.amountPaid, 0);
                      const outstanding = due - paid;
                      return (
                        <Group
                          key={u.id}
                          justify="space-between"
                          p="xs"
                          style={{
                            backgroundColor: "var(--mantine-color-gray-0)",
                            borderRadius: 8,
                            border: "1px solid var(--mantine-color-gray-2)",
                          }}
                        >
                          <Group gap="sm">
                            <Avatar size={30} radius="xl" color={getAvatarColor(u.name)} variant="light">
                              {getInitials(u.name)}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>{u.name}</Text>
                              <Badge size="xs" variant="dot" color={cfg.color}>{cfg.label}</Badge>
                            </div>
                          </Group>
                          {outstanding > 0 && (
                            <Text size="sm" c="dimmed">
                              <NumberFormatter prefix="$ " value={outstanding} thousandSeparator />
                            </Text>
                          )}
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
                            <Text
                              size="xs"
                              fw={700}
                              tt="uppercase"
                              c={isToday ? "blue" : "dimmed"}
                              mt={i > 0 ? "xs" : 0}
                              mb={4}
                            >
                              {isToday ? `Hoy · ${dayNames[dow]}` : dayNames[dow]}
                            </Text>
                          )}
                          <Group
                            justify="space-between"
                            align="center"
                            p="xs"
                            style={{
                              backgroundColor: isToday ? "var(--mantine-color-blue-0)" : "var(--mantine-color-gray-0)",
                              borderRadius: 8,
                              border: `1px solid ${isToday ? "var(--mantine-color-blue-2)" : "var(--mantine-color-gray-2)"}`,
                            }}
                          >
                            <Group gap="sm" align="center">
                              <Box
                                w={10}
                                h={10}
                                style={{
                                  borderRadius: "50%",
                                  backgroundColor: event.backgroundColor,
                                  flexShrink: 0,
                                }}
                              />
                              <Text size="sm" fw={500}>{event.title}</Text>
                              {event.extendedProps?.instructor && (
                                <Text size="sm" c="dimmed">{event.extendedProps.instructor}</Text>
                              )}
                            </Group>
                            <Text size="xs" c="dimmed">
                              {event.startTime.slice(0, 5)} – {event.endTime.slice(0, 5)}
                            </Text>
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
    </MainLayout>
  );
};

export default Dashboard;
