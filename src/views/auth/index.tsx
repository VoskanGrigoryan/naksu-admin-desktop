import {  Input, Paper, PasswordInput, Stack } from "@mantine/core";

import AuthLayout from "../../layouts/auth/AuthLayout";
import { useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";
import naksuLogo from "../../assets/naksu.svg";
import { IconKeyFilled, IconUser } from "@tabler/icons-react";
import CustomButton from "../../components/reusable/Button";

const AuthView = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <img src={naksuLogo} alt="Naksu Logo" style={{ height: 130 }} />
        </div>
        <Paper shadow="xl" radius="md" p="xl" className={styles.paper}>
          <Stack gap="md">
            <Input placeholder="Usuario" leftSection={<IconUser size={18} />} />
            <PasswordInput
              placeholder="Contraseña"
              leftSection={<IconKeyFilled size={18} />}
            />
            <CustomButton
              size="large"
              style={{ width: "100%" }}
              onClick={() => navigate("/")}
            >
              Iniciar sesión
            </CustomButton>
          </Stack>
        </Paper>
      </div>
    </AuthLayout>
  );
};

export default AuthView;