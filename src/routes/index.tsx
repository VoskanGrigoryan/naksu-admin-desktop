import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoadingOverlay } from "@mantine/core";

const AuthView = lazy(() => import("../views/auth"));
const Dashboard = lazy(() => import("../views/dashboard"));
const Users = lazy(() => import("../views/users"));
const UserDetail = lazy(() => import("../views/userDetail"));
const CalendarView = lazy(() => import("../views/calendar"));
const RoutinesView = lazy(() => import("../views/routines"));
const DietView = lazy(() => import("../views/diets"));

export default function RoutesConfig() {
  return (
    <Suspense fallback={<LoadingOverlay visible />}>
      <Routes>
        <Route path="/auth" element={<AuthView />} />

        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/user/:id" element={<UserDetail />} />

        <Route path="/classes" element={<CalendarView />} />
        <Route path="/routines" element={<RoutinesView />} />
        <Route path="/diets" element={<DietView />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
