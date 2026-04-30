import { Stack, Box, Tabs } from "@mantine/core";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { IconUser, IconBarbell } from "@tabler/icons-react";
import MainLayout from "../../layouts/main/MainLayout";
import UsersTable from "./UsersTable";

import { useUsersStore, type User } from "../../store/usersStore";
import { mockUsers } from "../../mocks/userTableData";
import MenuOptions from "./MenuOptions";
import NewUserModal, { type NewUserValues } from "./NewUserModal";

const Users = () => {
  const { users, setUsers, addUser } = useUsersStore();
  const [newUserOpened, { open: openNewUser, close: closeNewUser }] =
    useDisclosure(false);

  const handleReload = () => setUsers([...mockUsers]);

  const handleNewUser = (values: NewUserValues) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name: values.name,
      email: values.email,
      phone: values.phone ?? "",
      dni: values.dni,
      birthday: values.birthday,
      memberships: [],
      enrollments: [],
      active: true,
      lastActive: null,
      role: values.role,
      teachingDisciplines: values.teachingDisciplines,
    };
    addUser(newUser);
  };

  const clientCount = users.filter((u) => (u.role ?? "client") !== "trainer").length;
  const trainerCount = users.filter((u) => u.role === "trainer" || u.role === "both").length;

  return (
    <MainLayout>
      <Stack style={{ flex: 1 }} gap="sm">
        <MenuOptions
          initialLoading={false}
          handleReload={handleReload}
          userCount={users.length}
          onNewUser={openNewUser}
        />

        <Tabs defaultValue="clients" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Tabs.List mb="sm">
            <Tabs.Tab value="clients" leftSection={<IconUser size={14} />}>
              Clientes ({clientCount})
            </Tabs.Tab>
            <Tabs.Tab value="trainers" leftSection={<IconBarbell size={14} />}>
              Entrenadores ({trainerCount})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="clients" style={{ flex: 1 }}>
            <Box style={{ flex: 1, position: "relative" }}>
              <UsersTable loading={false} reloading={false} mode="clients" />
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="trainers" style={{ flex: 1 }}>
            <Box style={{ flex: 1, position: "relative" }}>
              <UsersTable loading={false} reloading={false} mode="trainers" />
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <NewUserModal
        opened={newUserOpened}
        onClose={closeNewUser}
        onSubmit={handleNewUser}
      />
    </MainLayout>
  );
};

export default Users;
