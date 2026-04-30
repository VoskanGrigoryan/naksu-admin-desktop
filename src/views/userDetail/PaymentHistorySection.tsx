import {
  Badge,
  Group,
  NumberFormatter,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconMoodEmpty, IconReceipt } from "@tabler/icons-react";
import type { PaymentRecord } from "../../store/usersStore";
import { classMeta } from "../users/columns";

const methodConfig: Record<string, { label: string; color: string }> = {
  cash: { label: "Efectivo", color: "green" },
  transfer: { label: "Transferencia", color: "blue" },
  card: { label: "Tarjeta", color: "violet" },
};

type Props = {
  paymentHistory: PaymentRecord[];
};

const PaymentHistorySection = ({ paymentHistory }: Props) => {
  const sorted = [...paymentHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <Paper shadow="sm" withBorder p="lg">
      <Group gap="xs" mb="md">
        <IconReceipt size={20} stroke={1.5} color="var(--mantine-color-blue-5)" />
        <Title order={2} fw={500}>Historial de pagos</Title>
      </Group>

      {sorted.length === 0 ? (
        <Stack align="center" gap={6} py="md">
          <IconMoodEmpty size={32} stroke={1.5} color="var(--mantine-color-gray-4)" />
          <Text size="sm" c="dimmed">Sin registros de pago</Text>
        </Stack>
      ) : (
        <ScrollArea.Autosize mah={280} type="hover" scrollbarSize={6} offsetScrollbars>
          <Stack gap="xs">
            {sorted.map((record) => {
              const method = methodConfig[record.method] ?? { label: record.method, color: "gray" };
              const meta = record.classType ? classMeta[record.classType] : null;
              return (
                <Group
                  key={record.id}
                  justify="space-between"
                  p="xs"
                  style={{
                    borderRadius: 8,
                    border: "1px solid var(--mantine-color-gray-2)",
                    backgroundColor: "var(--mantine-color-gray-0)",
                  }}
                >
                  <Group gap="sm">
                    <Stack gap={2}>
                      <Text size="sm" fw={500}>
                        <NumberFormatter prefix="$ " value={record.amount} thousandSeparator />
                      </Text>
                      <Text size="xs" c="dimmed">
                        {new Date(record.date).toLocaleDateString("es-AR")}
                      </Text>
                    </Stack>
                    {record.note && (
                      <Text size="xs" c="dimmed" style={{ maxWidth: 180 }}>{record.note}</Text>
                    )}
                  </Group>
                  <Group gap="xs">
                    {meta && (
                      <Badge size="xs" radius="sm" variant="light" color={meta.color}>
                        {meta.initials}
                      </Badge>
                    )}
                    <Badge size="xs" radius="sm" variant="light" color={method.color}>
                      {method.label}
                    </Badge>
                  </Group>
                </Group>
              );
            })}
          </Stack>
        </ScrollArea.Autosize>
      )}
    </Paper>
  );
};

export default PaymentHistorySection;
