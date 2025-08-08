import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import MobileDemo from "./pages/MobileDemo";
import BiometricDemo from "./pages/BiometricDemo";
import RegistrationStep1 from "@/pages/registration-step1";
import RegistrationStep2 from "@/pages/registration-step2";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AddNominee from "@/pages/add-nominee";
import AddAsset from "@/pages/add-asset";
import WellBeingSettings from "@/pages/well-being-settings";
import MoodTrackingPage from "@/pages/mood-tracking";
import WellnessDashboard from "@/pages/wellness-dashboard";
import AssetPortfolioPage from "@/pages/asset-portfolio";

import AdminPanel from "@/pages/admin-panel";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Debug authentication state in router
  console.log('Router - Auth state:', { isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/register/step1" component={RegistrationStep1} />
          <Route path="/register/step2" component={RegistrationStep2} />
          <Route path="/login" component={Login} />
          <Route path="/mobile-demo" component={MobileDemo} />
          <Route path="/biometric-demo" component={BiometricDemo} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin-panel" component={AdminPanel} />
          <Route path="/add-nominee" component={AddNominee} />
          <Route path="/add-asset" component={AddAsset} />
          <Route path="/well-being-settings" component={WellBeingSettings} />
          <Route path="/mood-tracking" component={MoodTrackingPage} />
          <Route path="/wellness-dashboard" component={WellnessDashboard} />
          <Route path="/assets" component={AssetPortfolioPage} />
          <Route path="/mobile-demo" component={MobileDemo} />
          <Route path="/biometric-demo" component={BiometricDemo} />
          {/* Also include login route for authenticated users to allow logout redirect */}
          <Route path="/login" component={Login} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
