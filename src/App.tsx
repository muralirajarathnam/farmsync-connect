import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { AuthGuard } from "./components/AuthGuard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Planning from "./pages/Planning";
import Diagnosis from "./pages/Diagnosis";
import Marketplace from "./pages/Marketplace";
import Farmersmedia from "./pages/Farmersmedia";
import Settings from "./pages/Settings";
import PlotDetails from "./pages/PlotDetails";
import CreatePlot from "./pages/CreatePlot";
import CropSelection from "./pages/CropSelection";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import "./i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route element={
              <AuthGuard>
                <AppLayout />
              </AuthGuard>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/planning" element={<Planning />} />
              <Route path="/diagnosis" element={<Diagnosis />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/community" element={<Farmersmedia />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/plots/:id" element={<PlotDetails />} />
            </Route>
            
            {/* Full-screen flows (no bottom nav) */}
            <Route element={<AuthGuard><div /></AuthGuard>}>
              <Route path="/plots/new" element={<CreatePlot />} />
              <Route path="/plots/:id/crop" element={<CropSelection />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
