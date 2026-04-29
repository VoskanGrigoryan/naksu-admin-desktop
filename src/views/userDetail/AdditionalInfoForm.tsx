import { Group, Paper, Textarea } from "@mantine/core";

const AdditionalInfoForm = () => {
  return (
    <Paper
      //   shadow={isEditing ? "xl" : "sm"}
      withBorder
      p="lg"
      style={{ transition: "box-shadow 150ms ease" }}
    >
      <Group align="start" justify="space-between">
        <Textarea
          placeholder="Comentarios adicionales"
          style={{ width: "60%" }}
          size="md"
          minRows={5}
          autosize
        />

        {/* <Stack>
          <Group>
            <Text fw={500}
           
          >
            Abona:
            
          </Text>
          <NumberFormatter prefix="$ " value={1000000} thousandSeparator  style={{
              backgroundColor: "var(--mantine-color-gray-1)",
              padding: "8px",
              fontWeight: 800,
              borderRadius: 4,
            }}/>
          </Group>
        </Stack> */}
      </Group>
    </Paper>
  );
};

export default AdditionalInfoForm;
