import { Group, Title } from "@mantine/core";
import type { ReactNode } from "react";
import CustomButton from "./reusable/Button";
import { IconCancel, IconCheck, IconEdit } from "@tabler/icons-react";

/* -------------------- types -------------------- */

export type Section = "userInfo" | "userPlan" | "additionalInfo" | "enrollments";

type SectionActionsProps = {
  title: string;
  section: Section;
  editingSection: Section | null;
  setEditingSection: (section: Section | null) => void;
  onSave?: () => void;
  editingActions?: ReactNode;
};

const SectionActions = ({
  title,
  section,
  editingSection,
  setEditingSection,
  onSave,
  editingActions,
}: SectionActionsProps) => {
  const isEditing = editingSection === section;
  const isOtherEditing = editingSection !== null && editingSection !== section;

  const handlePrimaryAction = () => {
    if (isEditing) {
      onSave?.(); // triggers form submit
      setEditingSection(null);
    } else {
      setEditingSection(section);
    }
  };

  return (
    <Group justify="space-between" mb="md">
      <Title order={2} fw={500}>{title}</Title>

      <Group>
        {isEditing && editingActions}
        <CustomButton
          rightSection={
            !isEditing ? (
              <IconEdit size={20} stroke={1.5} style={{ paddingBottom: 4 }} />
            ) : (
              <IconCheck size={20} stroke={1.5} style={{ paddingBottom: 4 }} />
            )
          }
          disabled={isOtherEditing}
          color={!isEditing ? "blue" : "green"}
          variant={isEditing ? "outline" : "filled"}
          onClick={handlePrimaryAction}
        >
          {!isEditing ? "Editar" : "Guardar"}
        </CustomButton>

        {isEditing && (
          <CustomButton
            color="red"
            rightSection={<IconCancel size={20} stroke={1.5} style={{ paddingBottom: 4 }} />}
            variant="light"
            onClick={() => setEditingSection(null)}
          >
            Cancelar
          </CustomButton>
        )}
      </Group>
    </Group>
  );
};

export default SectionActions;
