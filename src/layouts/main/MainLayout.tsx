import { AppShell, Stack, Tooltip, UnstyledButton, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import React from "react";
import {
  IconApple,
  IconBarbell,
  IconCalendar,
  IconHome2,
  IconLogout,
  IconMoon,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import styles from "./MainLayout.module.css";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "../../store/uiStore";

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, disabled, onClick }: NavbarLinkProps) {
  return (
    <Tooltip
      label={label}
      position="right"
      transitionProps={{ duration: 0 }}
      style={{ paddingTop: 8 }}
    >
      <UnstyledButton
        style={{ padding: "var(--mantine-spacing-xs)" }}
        onClick={disabled ? undefined : onClick}
        className={`${styles.link} ${disabled ? styles.linkDisabled : ""}`}
        data-active={active || undefined}
        aria-label={label}
        aria-disabled={disabled || undefined}
      >
        <Icon size={24} stroke={2} />
      </UnstyledButton>
    </Tooltip>
  );
}

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toggleColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme("light");

  const active = useUIStore((s) => s.selectedNavbarIndex);
  const setActive = useUIStore((s) => s.setSelectedNavbarIndex);

  const mockdata = [
    { icon: IconHome2, label: "Panel principal", path: "/", disabled: false },
    { icon: IconUser, label: "Usuarios", path: "/users", disabled: false },
    { icon: IconCalendar, label: "Clases", path: "/classes", disabled: false },
    { icon: IconBarbell, label: "Rutinas", path: "/routines", disabled: true },
    { icon: IconApple, label: "Dietas", path: "/diets", disabled: true },
  ];

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => {
        setActive(index);
        navigate(link.path);
      }}
    />
  ));

  return (
    <AppShell
      navbar={{
        width: { base: 60 },
        breakpoint: "xs",
      }}
    >
      <AppShell.Navbar
        className={styles.navbar}
        style={{ background: "linear-gradient(to bottom, #1e3a8a, #c92a2a)" }}
      >
        <div className={styles.navbarMain}>
          <Stack justify="center" gap={0}>
            {links}
          </Stack>
        </div>

        <Stack justify="center" gap={0}>
          <Tooltip label={colorScheme === "dark" ? "Modo claro" : "Modo oscuro"} position="right" transitionProps={{ duration: 0 }} style={{ paddingTop: 8 }}>
            <UnstyledButton style={{ padding: "var(--mantine-spacing-xs)", color: "white" }} onClick={toggleColorScheme} className={styles.link}>
              {colorScheme === "dark" ? <IconSun size={24} stroke={2} /> : <IconMoon size={24} stroke={2} />}
            </UnstyledButton>
          </Tooltip>
          <Tooltip label="Cerrar sesión" position="right" transitionProps={{ duration: 0 }} style={{ paddingTop: 8 }}>
            <UnstyledButton
              style={{ padding: "var(--mantine-spacing-xs)", color: "white" }}
              onClick={() => { setActive(0); navigate("/auth"); }}
              className={styles.link}
            >
              <IconLogout size={24} stroke={2} />
            </UnstyledButton>
          </Tooltip>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main
        style={{
          padding: "var(--mantine-spacing-xl)",
          marginLeft: "60px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: colorScheme === "dark" ? "var(--mantine-color-dark-8)" : "#f1f5f9",
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
};

export default MainLayout;
