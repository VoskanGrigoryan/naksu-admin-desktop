import { Group, MultiSelect } from "@mantine/core";
import CustomButton from "../../components/reusable/Button";
import { IconFilterOff, IconPlus } from "@tabler/icons-react";
import type { CalendarEvent } from "../../types/calendar";

const HeaderControls = ({
  open,
  filters,
  onFilter,
  events,
}: {
  open: () => void;
  filters: { instructors: string[]; activities: string[] };
  onFilter: (filters: { instructors: string[]; activities: string[] }) => void;
  events: CalendarEvent[];
}) => {
  const isDefault =
    filters.instructors.length === 0 && filters.activities.length === 0;

  const instructorOptions: string[] = Array.from(
    new Set(
      events
        .map((e) => e.extendedProps?.instructor)
        .filter((i): i is string => Boolean(i)),
    ),
  );

  const activityOptions: string[] = Array.from(
    new Set(
      events.map((e) => e.title).filter((t): t is string => Boolean(t)),
    ),
  );

  return (
    <Group justify="space-between" wrap="nowrap">
      <Group>
        <MultiSelect
          placeholder="Instructor"
          data={instructorOptions}
          w={300}
          value={filters.instructors}
          onChange={(v) => onFilter({ ...filters, instructors: v })}
        />

        <MultiSelect
          placeholder="Actividad"
          data={activityOptions}
          w={300}
          value={filters.activities}
          onChange={(v) => onFilter({ ...filters, activities: v })}
        />

        {!isDefault && (
          <CustomButton
            rightSection={
              <IconFilterOff size={16} style={{ marginBottom: 4 }} />
            }
            variant="outline"
            onClick={() => onFilter({ instructors: [], activities: [] })}
          >
            Limpiar filtro
          </CustomButton>
        )}
      </Group>

      <CustomButton
        onClick={open}
        rightSection={<IconPlus size={16} style={{ marginBottom: 4 }} />}
      >
        Agregar clase
      </CustomButton>
    </Group>
  );
};

export default HeaderControls;
