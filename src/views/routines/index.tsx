import { Badge, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconBarbell, IconCalendarStats, IconChartBar, IconUsers } from "@tabler/icons-react";
import MainLayout from "../../layouts/main/MainLayout";

const planned = [
  { icon: IconUsers, label: "Asignación por alumno", desc: "Asignar rutinas personalizadas a clientes específicos." },
  { icon: IconCalendarStats, label: "Progresión semanal", desc: "Definir bloques de entrenamiento con progresión de carga." },
  { icon: IconChartBar, label: "Seguimiento", desc: "Registrar el cumplimiento y evolución de cada rutina." },
  { icon: IconBarbell, label: "Biblioteca de ejercicios", desc: "Banco de ejercicios reutilizables con sets, reps y notas." },
];

const RoutinesView = () => (
  <MainLayout>
    <Stack gap="lg">
      <Stack gap={4}>
        <Group>
          <Title order={3} fw={700}>Rutinas</Title>
          <Badge variant="light" color="blue" size="sm">En desarrollo</Badge>
        </Group>
        <Text size="sm" c="dimmed">
          Esta sección permitirá a los entrenadores crear y asignar rutinas de entrenamiento personalizadas a cada alumno.
        </Text>
      </Stack>

      <SimpleGrid cols={2} spacing="md">
        {planned.map(({ icon: Icon, label, desc }) => (
          <Paper key={label} withBorder p="lg" radius="md">
            <Stack gap="sm">
              <ThemeIcon variant="light" color="blue" size={36} radius="md">
                <Icon size={20} stroke={1.5} />
              </ThemeIcon>
              <Text fw={600} size="sm">{label}</Text>
              <Text size="xs" c="dimmed">{desc}</Text>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  </MainLayout>
);

export default RoutinesView;
