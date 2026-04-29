import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Badge,
  Divider,
  Group,
  MultiSelect,
  Paper,
  ScrollArea,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCalendar,
  IconCancel,
  IconCheck,
  IconClockHour4,
  IconEdit,
  IconId,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import type { UseFormReturn } from "react-hook-form";

import MainLayout from "../../layouts/main/MainLayout";
import { mockUsers } from "../../mocks/userTableData";
import UserInfoForm from "./UserInfoForm";
import UserPlanForm from "./UserPlanForm";
import EnrollmentsSection from "./EnrollmentsSection";
import CustomButton from "../../components/reusable/Button";

import type { UserInfoFormValues } from "../../schemas/userInfoSchema";
import type { MembershipFormValues } from "../../schemas/userPlanSchema";

import { useUsersStore, type Enrollment, type UserRole, type ClassType } from "../../store/usersStore";
import { classMeta, getAvatarColor, getInitials, paymentConfig } from "../users/columns";
import { getPaymentStatus } from "../../utils/helpers/getPaymentStatus";

const disabledInputStyles = {
  input: {
    opacity: 0.9,
    WebkitTextFillColor: "var(--mantine-color-gray-8)",
  },
};

const UserDetail = () => {
  const { users, updateUser, setUsers } = useUsersStore();
  const { id } = useParams();

  const userInfoFormRef = useRef<UseFormReturn<UserInfoFormValues>>(null);
  const membershipFormRef = useRef<UseFormReturn<MembershipFormValues>>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editRole, setEditRole] = useState<UserRole>("client");
  const [editDisciplines, setEditDisciplines] = useState<ClassType[]>([]);

  useEffect(() => {
    setUsers(mockUsers);
  }, []);

  const user = users.find((u) => u.id === id);
  if (!user) return <div>User not found</div>;

  const paymentStatus = getPaymentStatus(user);

  const handleSave = async () => {
    let valid = true;

    await userInfoFormRef.current?.handleSubmit(
      (values) => { updateUser(id!, values); },
      () => { valid = false; },
    )();

    if (user.role !== "trainer") {
      await membershipFormRef.current?.handleSubmit(
        (values) => { updateUser(id!, { memberships: values.memberships }); },
        () => { valid = false; },
      )();
    }

    if (valid) {
      updateUser(id!, { role: editRole, teachingDisciplines: editRole === "client" ? [] : editDisciplines });
      notifications.show({
        title: "Cambios guardados",
        message: "La información del cliente fue actualizada correctamente.",
        color: "green",
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditRole(user.role);
    setEditDisciplines(user.teachingDisciplines);
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setEditRole(user.role);
    setEditDisciplines(user.teachingDisciplines);
    setIsEditing(true);
  };

  const handleAddEnrollment = (eventId: string) => {
    updateUser(id!, {
      enrollments: [...user.enrollments, { id: crypto.randomUUID(), eventId }],
    });
  };

  const handleRemoveEnrollment = (enrollmentId: string) => {
    updateUser(id!, {
      enrollments: user.enrollments.filter((e: Enrollment) => e.id !== enrollmentId),
    });
  };

  return (
    <MainLayout>
      <ScrollArea h="calc(100vh - 32px)" type="hover" scrollbarSize={6} offsetScrollbars styles={{ viewport: { paddingRight: 12 } }}>
      <Group justify="space-between">
        <CustomButton
          onClick={() => window.history.back()}
          w="fit-content"
          variant="light"
          rightSection={
            <IconArrowLeft size={24} stroke={1.5} style={{ paddingBottom: 4 }} />
          }
        >
          Volver
        </CustomButton>

        <Group gap="xs">
          {isEditing ? (
            <>
              <CustomButton
                color="green"
                variant="outline"
                rightSection={<IconCheck size={16} stroke={1.5} style={{ paddingBottom: 2 }} />}
                onClick={handleSave}
              >
                Guardar
              </CustomButton>
              <CustomButton
                color="red"
                variant="light"
                rightSection={<IconCancel size={16} stroke={1.5} style={{ paddingBottom: 2 }} />}
                onClick={handleCancel}
              >
                Cancelar
              </CustomButton>
            </>
          ) : (
            <CustomButton
              rightSection={<IconEdit size={16} stroke={1.5} style={{ paddingBottom: 2 }} />}
              onClick={handleStartEditing}
            >
              Editar
            </CustomButton>
          )}
        </Group>
      </Group>

      {/* Profile card */}
      <Paper
        shadow={isEditing ? "lg" : "sm"}
        withBorder
        p="lg"
        mt="md"
        style={{ transition: "box-shadow 150ms ease" }}
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="xl" align="flex-start" wrap="nowrap">
            <Avatar
              size={72}
              radius="xl"
              color={getAvatarColor(user.name)}
              variant="light"
              style={{ flexShrink: 0, fontSize: 26 }}
            >
              {getInitials(user.name)}
            </Avatar>

            <Stack gap="sm">
              <Title order={2} fw={600} lh={1}>
                {user.name}
              </Title>
              <Group gap="xs">
                <Badge size="sm" variant="dot" color={user.active ? "green" : "gray"}>
                  {user.active ? "Activo" : "Inactivo"}
                </Badge>
                {user.role !== "trainer" && (
                  <Badge size="sm" variant="dot" color={paymentConfig[paymentStatus].color}>
                    {paymentConfig[paymentStatus].label}
                  </Badge>
                )}
                {(user.role === "trainer" || user.role === "both") && (
                  <Badge size="sm" variant="light" color="violet">
                    {user.role === "both" ? "Entrenador / Cliente" : "Entrenador"}
                  </Badge>
                )}
              </Group>
              <Group gap="xl" mt="xs" wrap="wrap">
                <Group gap={4}>
                  <IconMail size={13} color="var(--mantine-color-gray-5)" />
                  <Text size="sm" c="dimmed">{user.email || "—"}</Text>
                </Group>
                {user.phone && (
                  <Group gap={4}>
                    <IconPhone size={13} color="var(--mantine-color-gray-5)" />
                    <Text size="sm" c="dimmed">{user.phone}</Text>
                  </Group>
                )}
                {user.dni && (
                  <Group gap={4}>
                    <IconId size={13} color="var(--mantine-color-gray-5)" />
                    <Text size="sm" c="dimmed">DNI {user.dni}</Text>
                  </Group>
                )}
                {user.birthday && (
                  <Group gap={4}>
                    <IconCalendar size={13} color="var(--mantine-color-gray-5)" />
                    <Text size="sm" c="dimmed">
                      {user.birthday.toLocaleDateString("es-AR")}
                    </Text>
                  </Group>
                )}
                {user.lastActive && (
                  <Group gap={4}>
                    <IconClockHour4 size={13} color="var(--mantine-color-gray-5)" />
                    <Text size="sm" c="dimmed">
                      Última actividad: {user.lastActive.toLocaleDateString("es-AR")}
                    </Text>
                  </Group>
                )}
              </Group>
              {(user.role === "trainer" || user.role === "both") && user.teachingDisciplines.length > 0 && (
                <Group gap="xs" mt={2}>
                  <Text size="sm" c="dimmed">Enseña:</Text>
                  {user.teachingDisciplines.map((d) => {
                    const meta = classMeta[d];
                    return (
                      <Badge key={d} size="sm" radius="sm" variant="light" color={meta?.color ?? "gray"}>
                        {meta?.initials ?? d}
                      </Badge>
                    );
                  })}
                </Group>
              )}
            </Stack>
          </Group>

          <Switch
            label={user.active ? "Activo" : "Inactivo"}
            checked={user.active}
            color="green"
            style={{ flexShrink: 0 }}
            onChange={() => updateUser(id!, { active: !user.active })}
          />
        </Group>

        {isEditing && (
          <>
            <Divider my="lg" />
            <UserInfoForm
              ref={userInfoFormRef}
              isEditing
              disabledInputStyles={disabledInputStyles}
              defaultValues={user}
              onSubmit={(values) => updateUser(id!, values)}
              withPaper={false}
            />
            <Divider my="md" />
            <Group gap="xl" align="flex-end" wrap="wrap">
              <Stack gap={6}>
                <Text size="sm" fw={500}>Rol</Text>
                <SegmentedControl
                  size="xs"
                  value={editRole}
                  onChange={(v) => setEditRole(v as UserRole)}
                  radius="md"
                  withItemsBorders
                  data={[
                    { value: "client", label: "Cliente" },
                    { value: "trainer", label: "Entrenador" },
                    { value: "both", label: "Ambos" },
                  ]}
                />
              </Stack>
              {editRole !== "client" && (
                <MultiSelect
                  label="Disciplinas que enseña"
                  placeholder="Seleccionar disciplinas"
                  data={Object.entries(classMeta).map(([v, m]) => ({ value: v, label: m.label }))}
                  value={editDisciplines}
                  onChange={(v) => setEditDisciplines(v as ClassType[])}
                  size="sm"
                  style={{ minWidth: 300 }}
                />
              )}
            </Group>
          </>
        )}
      </Paper>

      {/* Memberships section — hidden for pure trainers */}
      {user.role !== "trainer" && (
        <Paper
          shadow={isEditing ? "xl" : "sm"}
          withBorder
          p="lg"
          mt="lg"
          style={{ transition: "box-shadow 150ms ease" }}
        >
          <Title order={2} fw={500} mb="md">Membresías</Title>
          <UserPlanForm
            ref={membershipFormRef}
            isEditing={isEditing}
            disabledInputStyles={disabledInputStyles}
            defaultValues={{ memberships: user.memberships ?? [] }}
            onSubmit={(values) => updateUser(id!, { memberships: values.memberships })}
            withPaper={false}
          />
        </Paper>
      )}

      {/* Enrollments section */}
      <div style={{ marginTop: 16, marginBottom: 24 }}>
        <EnrollmentsSection
          enrollments={user.enrollments ?? []}
          isEditing={isEditing}
          onAdd={handleAddEnrollment}
          onRemove={handleRemoveEnrollment}
        />
      </div>
      </ScrollArea>
    </MainLayout>
  );
};

export default UserDetail;
