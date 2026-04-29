import {
  ActionIcon,
  Box,
  Group,
  Paper,
  SegmentedControl,
  TextInput,
} from "@mantine/core";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import sortBy from "lodash/sortBy";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import { useUsersStore } from "../../store/usersStore";
import { IconSearch, IconX } from "@tabler/icons-react";
import { getUserColumns, getTrainerColumns } from "./columns";
import { getPaymentStatus } from "../../utils/helpers/getPaymentStatus";
import type { PaymentStatus } from "./columns";

export default function UsersTable({
  loading,
  reloading,
  mode,
}: {
  loading: boolean;
  reloading: boolean;
  mode: "clients" | "trainers";
}) {
  const navigate = useNavigate();
  const { users } = useUsersStore();

  type User = (typeof users)[number];

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 200);
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>("all");

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<User>>({
    columnAccessor: "name",
    direction: "asc",
  });

  const filteredRecords = useMemo(() => {
    return users.filter((u) => {
      const role = u.role ?? "client";

      if (mode === "clients" && role === "trainer") return false;
      if (mode === "trainers" && role === "client") return false;

      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase().trim();
        const matches =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone ?? "").includes(q);
        if (!matches) return false;
      }

      if (mode === "clients" && paymentFilter !== "all") {
        if (getPaymentStatus(u) !== paymentFilter) return false;
      }

      return true;
    });
  }, [users, debouncedSearch, paymentFilter, mode]);

  const records = useMemo(() => {
    if (!sortStatus.columnAccessor) return filteredRecords;
    const data = sortBy(filteredRecords, sortStatus.columnAccessor as keyof User) as User[];
    return sortStatus.direction === "desc" ? data.reverse() : data;
  }, [filteredRecords, sortStatus]);

  const columns = mode === "clients"
    ? getUserColumns({ navigate, sortStatus, setSortStatus })
    : getTrainerColumns({ navigate, sortStatus, setSortStatus });

  return (
    <Box style={{ flex: 1, minHeight: 0 }}>
      <Group justify="space-between" mb="sm" wrap="nowrap">
        <TextInput
          placeholder={mode === "clients" ? "Buscar por nombre, correo o celular…" : "Buscar entrenador…"}
          leftSection={<IconSearch size={15} />}
          rightSection={
            searchQuery ? (
              <ActionIcon size="sm" variant="transparent" onClick={() => setSearchQuery("")}>
                <IconX size={14} />
              </ActionIcon>
            ) : null
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ width: 300 }}
          radius="md"
          size="sm"
        />

        {mode === "clients" && (
          <SegmentedControl
            value={paymentFilter}
            onChange={(v) => setPaymentFilter(v as typeof paymentFilter)}
            size="xs"
            radius="md"
            withItemsBorders
            data={[
              { value: "all", label: "Todos" },
              { value: "paid", label: "Abonado" },
              { value: "pending", label: "Pendiente" },
              { value: "overdue", label: "Vencido" },
            ]}
          />
        )}
      </Group>

      <Paper radius="md" shadow="sm" style={{ height: "calc(100vh - 230px)" }}>
        <DataTable
          fetching={loading || reloading}
          withTableBorder
          highlightOnHover
          loaderType="oval"
          verticalSpacing="sm"
          loaderSize="lg"
          loaderColor="blue"
          loaderBackgroundBlur={4}
          records={records}
          columns={columns}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          onRowClick={({ record }) => navigate(`/user/${record.id}`)}
          noRecordsText={mode === "clients" ? "No se han encontrado clientes" : "No se han encontrado entrenadores"}
          height="calc(100vh - 230px)"
          style={{ borderRadius: "var(--mantine-radius-md)" }}
          styles={{
            table: { backgroundColor: "white" },
            header: {
              backgroundColor: "var(--mantine-color-gray-1)",
              borderBottom: "2px solid var(--mantine-color-gray-3)",
            },
          }}
        />
      </Paper>
    </Box>
  );
}
