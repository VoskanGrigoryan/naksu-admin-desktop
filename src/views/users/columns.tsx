/* eslint-disable react-refresh/only-export-components */
import {
  ActionIcon,
  Avatar,
  Badge,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconEye, IconTrash } from "@tabler/icons-react";
import type { DataTableSortStatus } from "mantine-datatable";
import type { Dispatch, SetStateAction } from "react";
import type { User } from "../../store/usersStore";
import { getPaymentStatus } from "../../utils/helpers/getPaymentStatus";

export type PaymentStatus = "paid" | "pending" | "overdue";

export const paymentConfig: Record<PaymentStatus, { color: string; label: string }> = {
  paid: { color: "green", label: "Abonado" },
  pending: { color: "yellow", label: "Pendiente" },
  overdue: { color: "red", label: "Vencido" },
};

export const classMeta: Record<
  string,
  { initials: string; label: string; color: string }
> = {
  muay_thai: { initials: "MT", label: "Muay Thai", color: "orange" },
  sipalki_do: { initials: "SD", label: "Sipalki Do", color: "grape" },
  competidores: { initials: "CO", label: "Competidores", color: "red" },
  kick_boxing: { initials: "KB", label: "Kick Boxing", color: "cyan" },
  boxeo: { initials: "BX", label: "Boxeo", color: "blue" },
  boxeo_comp_thai: { initials: "BCT", label: "Boxeo Comp. Thai", color: "violet" },
  yoga: { initials: "YG", label: "Yoga", color: "teal" },
};

const avatarColors = ["blue", "teal", "violet", "orange", "grape", "indigo", "cyan"];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

interface ColumnsParams {
  navigate: (path: string) => void;
  sortStatus: DataTableSortStatus<User>;
  setSortStatus: Dispatch<SetStateAction<DataTableSortStatus<User>>>;
}

function MembershipBadges({ user }: { user: User }) {
  if (!user.memberships?.length) return <Text size="sm" c="dimmed" ta="center">—</Text>;
  return (
    <Group gap={4} wrap="wrap">
      {user.memberships.map((c, i) => {
        const meta = classMeta[c.classType];
        return (
          <Tooltip key={i} label={`${meta?.label ?? c.classType} · ${c.totalClasses} clases`} withArrow transitionProps={{ duration: 80 }}>
            <Badge size="sm" radius="sm" variant="light" color={meta?.color ?? "gray"} style={{ cursor: "default" }}>
              {meta?.initials ?? "?"}
            </Badge>
          </Tooltip>
        );
      })}
    </Group>
  );
}

function DisciplineBadges({ user }: { user: User }) {
  if (!user.teachingDisciplines?.length) return <Text size="sm" c="dimmed" ta="center">—</Text>;
  return (
    <Group gap={4} wrap="wrap">
      {user.teachingDisciplines.map((d) => {
        const meta = classMeta[d];
        return (
          <Tooltip key={d} label={meta?.label ?? d} withArrow transitionProps={{ duration: 80 }}>
            <Badge size="sm" radius="sm" variant="light" color={meta?.color ?? "gray"} style={{ cursor: "default" }}>
              {meta?.initials ?? "?"}
            </Badge>
          </Tooltip>
        );
      })}
    </Group>
  );
}

function RowActions({ record, navigate, label }: { record: User; navigate: (p: string) => void; label: string }) {
  return (
    <Group gap={4} wrap="nowrap" justify="center">
      <Tooltip label="Ver perfil" withArrow transitionProps={{ duration: 80 }}>
        <ActionIcon size="sm" variant="subtle" color="blue" onClick={(e) => { e.stopPropagation(); navigate(`/user/${record.id}`); }}>
          <IconEye size={15} stroke={2} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={label} withArrow transitionProps={{ duration: 80 }}>
        <ActionIcon size="sm" variant="subtle" color="red" onClick={(e) => e.stopPropagation()}>
          <IconTrash size={15} stroke={2} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}

export function getTrainerColumns({ navigate }: ColumnsParams) {
  return [
    {
      accessor: "name",
      title: "Entrenador",
      sortable: true,
      width: "20%",
      render: (record: User) => (
        <Group gap="xs" wrap="nowrap">
          <Avatar size={34} radius="xl" color={getAvatarColor(record.name)} variant="filled" style={{ flexShrink: 0 }}>
            {getInitials(record.name)}
          </Avatar>
          <div>
            <Text size="sm" fw={500} lineClamp={1}>{record.name}</Text>
            <Group gap={4} mt={2}>
              <Badge size="xs" radius="xl" variant="dot" color={record.active ? "green" : "gray"}>
                {record.active ? "Activo" : "Inactivo"}
              </Badge>
              {record.role === "both" && (
                <Badge size="xs" radius="xl" variant="light" color="violet">Entrenador / Cliente</Badge>
              )}
            </Group>
          </div>
        </Group>
      ),
    },
    {
      accessor: "email",
      title: "Correo electrónico",
      sortable: true,
      width: "18%",
      render: (record: User) => <Text size="sm" c="dimmed" lineClamp={1}>{record.email}</Text>,
    },
    {
      accessor: "phone",
      title: "Celular",
      width: "9%",
      render: (record: User) => <Text size="sm" c={record.phone ? undefined : "dimmed"}>{record.phone ?? "—"}</Text>,
    },
    {
      accessor: "dni",
      title: "DNI",
      width: "9%",
      render: (record: User) => <Text size="sm" c={record.dni ? undefined : "dimmed"}>{record.dni ?? "—"}</Text>,
    },
    {
      accessor: "teachingDisciplines",
      title: "Clases dadas",
      width: "18%",
      render: (record: User) => <DisciplineBadges user={record} />,
    },
    {
      accessor: "memberships",
      title: "Clases recibidas",
      width: "18%",
      render: (record: User) =>
        record.role !== "both"
          ? <Text size="sm" c="dimmed" ta="center">—</Text>
          : <MembershipBadges user={record} />,
    },
    {
      accessor: "actions",
      title: "",
      width: "4%",
      render: (record: User) => <RowActions record={record} navigate={navigate} label="Eliminar entrenador" />,
    },
  ];
}

export function getUserColumns({ navigate }: ColumnsParams) {
  return [
    {
      accessor: "name",
      title: "Usuario",
      sortable: true,
      width: "20%",
      render: (record: User) => (
        <Group gap="xs" wrap="nowrap">
          <Avatar size={34} radius="xl" color={getAvatarColor(record.name)} variant="filled" style={{ flexShrink: 0 }}>
            {getInitials(record.name)}
          </Avatar>
          <div>
            <Text size="sm" fw={500} lineClamp={1}>{record.name}</Text>
            <Group gap={4} mt={2}>
              <Badge size="xs" radius="xl" variant="dot" color={record.active ? "green" : "gray"}>
                {record.active ? "Activo" : "Inactivo"}
              </Badge>
              {record.role === "both" && (
                <Badge size="xs" radius="xl" variant="light" color="violet">Entrenador / Cliente</Badge>
              )}
            </Group>
          </div>
        </Group>
      ),
    },
    {
      accessor: "email",
      title: "Correo electrónico",
      sortable: true,
      width: "18%",
      render: (record: User) => <Text size="sm" c="dimmed" lineClamp={1}>{record.email}</Text>,
    },
    {
      accessor: "phone",
      title: "Celular",
      width: "9%",
      render: (record: User) => <Text size="sm" c={record.phone ? undefined : "dimmed"}>{record.phone ?? "—"}</Text>,
    },
    {
      accessor: "dni",
      title: "DNI",
      width: "9%",
      render: (record: User) => <Text size="sm" c={record.dni ? undefined : "dimmed"}>{record.dni ?? "—"}</Text>,
    },
    {
      accessor: "birthday",
      title: "Nacimiento",
      sortable: true,
      width: "9%",
      render: (record: User) => (
        <Text size="sm" c={record.birthday ? undefined : "dimmed"}>
          {record.birthday?.toLocaleDateString("es-AR") ?? "—"}
        </Text>
      ),
      sortAccessor: (record: User) => record.birthday?.getTime() ?? 0,
    },
    {
      accessor: "classes",
      title: "Clases recibidas",
      width: "18%",
      render: (record: User) => <MembershipBadges user={record} />,
    },
    {
      accessor: "paymentStatus",
      title: "Pago",
      width: "9%",
      render: (record: User) => {
        const status = getPaymentStatus(record);
        const config = paymentConfig[status];
        return <Badge variant="dot" radius="xl" size="sm" color={config.color}>{config.label}</Badge>;
      },
    },
    {
      accessor: "actions",
      title: "",
      width: "4%",
      render: (record: User) => <RowActions record={record} navigate={navigate} label="Eliminar usuario" />,
    },
  ];
}
