import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PageLoader from "./components/PageLoader/PageLoader";
import RouteTransition from "./components/PageLoader/RouteTransition";

const LandingPage = lazy(() => import("./pages/LandingPage/LandingPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage/DashboardPage"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <RouteTransition />
    </BrowserRouter>
  );
}
