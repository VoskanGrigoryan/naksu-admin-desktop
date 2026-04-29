import {
  IconDownload,
  IconPlus,
  IconReload,
  IconUpload,
} from "@tabler/icons-react";
import CustomButton from "../../components/reusable/Button";
import { Group, Text, Title } from "@mantine/core";

const MenuOptions = ({
  initialLoading,
  handleReload,
  userCount,
  onNewUser,
}: {
  initialLoading: boolean;
  handleReload: () => void;
  userCount: number;
  onNewUser: () => void;
}) => {
  return (
    <Group justify="space-between" align="center">
      <Group gap="xs" align="baseline">
        <Title order={3} fw={700}>
          Usuarios
        </Title>
        {!initialLoading && (
          <Text size="sm" c="dimmed">
            {userCount} {userCount === 1 ? "usuario" : "usuarios"}
          </Text>
        )}
      </Group>

      <Group gap="xs">
        <CustomButton
          loading={initialLoading}
          variant="outline"
          color="gray"
          rightSection={<IconDownload size={15} stroke={1.5} />}
        >
          Importar
        </CustomButton>

        <CustomButton
          loading={initialLoading}
          variant="outline"
          color="gray"
          rightSection={<IconUpload size={15} stroke={1.5} />}
        >
          Exportar
        </CustomButton>

        <CustomButton
          withProgress
          progressDuration={500}
          loading={initialLoading}
          variant="outline"
          color="green"
          rightSection={<IconReload size={15} stroke={1.5} />}
          onClick={handleReload}
        >
          Actualizar
        </CustomButton>

        <CustomButton
          loading={initialLoading}
          rightSection={<IconPlus size={15} stroke={2} />}
          onClick={onNewUser}
        >
          Nuevo usuario
        </CustomButton>
      </Group>
    </Group>
  );
};

export default MenuOptions;
