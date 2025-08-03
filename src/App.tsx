import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Auth from "@/pages/Auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import PostPage from "@/pages/PostPage";
import About from "@/pages/About";
import PostsPage from "@/pages/PostsPage";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminPosts } from "@/pages/admin/Posts";
import { AdminCategories } from "@/pages/admin/Categories";
import { AdminSettings } from "@/pages/admin/Settings";
import { SettingsProvider } from "@/context/SettingsContext";
import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient();

const AdminRoutes = () => (
  <ProtectedRoute>
    <AdminLayout />
  </ProtectedRoute>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SettingsProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/posts" element={<PostsPage />} />
                <Route path="/posts/:slug" element={<PostPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth" element={<Auth />} />
                
                <Route path="/admin" element={<AdminRoutes />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="posts" element={<AdminPosts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </SettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;