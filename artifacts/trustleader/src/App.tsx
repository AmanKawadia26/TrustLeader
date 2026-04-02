import { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import "@/lib/i18n"; // initialize i18n

const Home = lazy(() => import("@/pages/Home"));
const BusinessProfile = lazy(() => import("@/pages/BusinessProfile"));
const WriteReview = lazy(() => import("@/pages/WriteReview"));
const About = lazy(() => import("@/pages/About"));
const Categories = lazy(() => import("@/pages/Categories"));
const SearchPage = lazy(() => import("@/pages/Search"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const CompanyDashboard = lazy(() => import("@/pages/dashboard/CompanyDashboard"));
const ConsumerDashboard = lazy(() => import("@/pages/dashboard/ConsumerDashboard"));
const ResellerDashboard = lazy(() => import("@/pages/dashboard/ResellerDashboard"));

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, allowedRoles }: { component: any, allowedRoles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/categories" component={Categories} />
        <Route path="/search" component={SearchPage} />
        <Route path="/business/:id" component={BusinessProfile} />
        
        {/* Auth routes */}
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/register/business" component={Register} />
        <Route path="/auth/register" component={Register} />
        
        {/* Protected action routes */}
        <Route path="/write-review/:businessId">
          {() => <ProtectedRoute component={WriteReview} />}
        </Route>
        
        {/* Dashboards */}
        <Route path="/dashboard/company">
          {() => <ProtectedRoute component={CompanyDashboard} allowedRoles={['company']} />}
        </Route>
        <Route path="/dashboard/consumer">
          {() => <ProtectedRoute component={ConsumerDashboard} allowedRoles={['consumer']} />}
        </Route>
        <Route path="/dashboard/reseller">
          {() => <ProtectedRoute component={ResellerDashboard} allowedRoles={['reseller']} />}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
