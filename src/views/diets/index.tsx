import { Badge, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconApple, IconClipboardList, IconScale, IconUser } from "@tabler/icons-react";
import MainLayout from "../../layouts/main/MainLayout";

const planned = [
  { icon: IconUser, label: "Planes por alumno", desc: "Crear y asignar planes nutricionales individualizados." },
  { icon: IconClipboardList, label: "Plantillas de dieta", desc: "Biblioteca de planes reutilizables por objetivo (volumen, definición, etc.)." },
  { icon: IconScale, label: "Seguimiento de peso", desc: "Registrar evolución corporal y ajustar el plan en consecuencia." },
  { icon: IconApple, label: "Banco de alimentos", desc: "Configurar alimentos con macros para armar comidas personalizadas." },
];

const DietView = () => (
  <MainLayout>
    <Stack gap="lg">
      <Stack gap={4}>
        <Group>
          <Title order={3} fw={700}>Dietas</Title>
          <Badge variant="light" color="teal" size="sm">En desarrollo</Badge>
        </Group>
        <Text size="sm" c="dimmed">
          Esta sección permitirá gestionar planes nutricionales personalizados para cada cliente del gimnasio.
        </Text>
      </Stack>

      <SimpleGrid cols={2} spacing="md">
        {planned.map(({ icon: Icon, label, desc }) => (
          <Paper key={label} withBorder p="lg" radius="md">
            <Stack gap="sm">
              <ThemeIcon variant="light" color="teal" size={36} radius="md">
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

export default DietView;
