import {
  Button,
  Progress,
  rgba,
  useMantineTheme,
  type ButtonProps,
} from "@mantine/core";
import { useInterval } from "@mantine/hooks";
import { useState, type MouseEvent } from "react";

type CustomButtonProps = Omit<ButtonProps, "onClick"> & {
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  withProgress?: boolean;
  progressDuration?: number;
  type?: "button" | "submit" | "reset";
};

const CustomButton = ({
  variant = "filled",
  color = "blue",
  leftSection,
  rightSection,
  onClick,
  withProgress = false,
  progressDuration = 800,
  size = "sm",
  children,
  ...props
}: CustomButtonProps) => {
  const theme = useMantineTheme();
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const step = 100 / (progressDuration / 20);

  const interval = useInterval(
    () =>
      setProgress((current) => {
        if (current < 100) {
          return current + step;
        }
        interval.stop();
        setLoaded(true);
        return 0;
      }),
    20,
  );

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    if (withProgress) {
      setLoaded(false);
      if (!interval.active) interval.start();
    }
    await onClick?.(e);
  };

  return (
    <Button
      variant={variant}
      color={loaded && withProgress ? "green" : color}
      onClick={handleClick}
      leftSection={leftSection}
      rightSection={rightSection}
      size={size}
      {...props}
      style={{
        paddingTop: 4,
        position: "relative",
        transition: "background-color 150ms ease",
      }}
    >
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>

      {withProgress && progress !== 0 && (
        <Progress
          value={progress}
          radius="sm"
          color={rgba(theme.colors[color][2], 0.35)}
          style={{
            position: "absolute",
            top: -1,
            left: -1,
            right: -1,
            bottom: -1,
            height: "auto",
            backgroundColor: "transparent",
            zIndex: 0,
          }}
        />
      )}
    </Button>
  );
};

export default CustomButton;
