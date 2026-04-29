import { AppShell } from "@mantine/core";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppShell>
      <AppShell.Main style={{ backgroundColor: "#0f172a", minHeight: "100vh" }}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
};

export default AuthLayout;
