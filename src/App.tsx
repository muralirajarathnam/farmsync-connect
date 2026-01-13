import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
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

// Auth0 configuration
const AUTH0_DOMAIN = "dev-xwri8q5ip0efib0q.us.auth0.com";
const AUTH0_CLIENT_ID = "jt6UJ67RL8TR1VrefrMgIfIVT3y08JIn";

const App = () => (
  <ErrorBoundary>
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
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
              <Route element={<AuthGuard><Outlet /></AuthGuard>}>
                <Route path="/plots/new" element={<CreatePlot />} />
                <Route path="/plots/:id/crop" element={<CropSelection />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Auth0Provider>
  </ErrorBoundary>
);

export default App;
