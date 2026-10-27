import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageLoader } from "@/components/ui/page-loader";
import { PageTransitionShell } from "@/components/ui/page-transition-shell";

const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const Contact = lazy(() => import("./pages/Contact"));
const AppHome = lazy(() => import("./pages/app/AppHome"));
const AppExplore = lazy(() => import("./pages/app/Explore"));
const Explore = lazy(() => import("./pages/ExplorePublic"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const PostJob = lazy(() => import("./pages/app/PostJob"));
const JobDetail = lazy(() => import("./pages/app/JobDetail"));
const Messages = lazy(() => import("./pages/app/Messages"));
const Profile = lazy(() => import("./pages/app/Profile"));
const Saved = lazy(() => import("./pages/app/Saved"));
const Wallet = lazy(() => import("./pages/app/Wallet"));
const WorkerProfile = lazy(() => import("./pages/WorkerProfile"));
const Jobs = lazy(() => import("./pages/app/Jobs"));
const AutoMatch = lazy(() => import("./pages/app/AutoMatch"));
const AdminDashboard = lazy(() => import("./pages/app/AdminDashboard"));
const Settings = lazy(() => import("./pages/app/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PageTransitionShell>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/workers/:id" element={<WorkerProfile />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin/auth" element={<AdminAuth />} />
                {/* Public job preview — viewing details does not require sign-in */}
                <Route path="/jobs/:id" element={<JobDetail />} />

                <Route path="/app" element={<ProtectedRoute><AppHome /></ProtectedRoute>} />
                <Route path="/app/explore" element={<ProtectedRoute><AppExplore /></ProtectedRoute>} />
                <Route path="/app/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
                <Route path="/app/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/app/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/app/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/app/saved" element={<ProtectedRoute allowedRoles={["worker"]}><Saved /></ProtectedRoute>} />
                <Route path="/app/post" element={<ProtectedRoute allowedRoles={["client"]}><PostJob /></ProtectedRoute>} />
                <Route path="/app/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                <Route path="/app/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
                <Route path="/app/automatch" element={<ProtectedRoute allowedRoles={["worker"]}><AutoMatch /></ProtectedRoute>} />
                <Route path="/app/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </PageTransitionShell>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
