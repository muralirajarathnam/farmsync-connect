import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { AuthGuard } from "./components/AuthGuard";
import Dashboard from "./pages/Dashboard";
import Planning from "./pages/Planning";
import Diagnosis from "./pages/Diagnosis";
import Settings from "./pages/Settings";
import PlotDetails from "./pages/PlotDetails";
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
            <Route path="/settings" element={<Settings />} />
            <Route path="/plots/:id" element={<PlotDetails />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
