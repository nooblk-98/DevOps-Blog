import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import PostPage from "@/pages/PostPage";
import About from "@/pages/About";
import PostsPage from "@/pages/PostsPage";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminPosts } from "@/pages/admin/Posts";
import { AdminCategories } from "@/pages/admin/Categories";
import { AdminComments } from "@/pages/admin/Comments";
import AdminSettingsLayout from "@/pages/admin/settings/Layout";
import AdminSettingsSite from "@/pages/admin/settings/Site";
import AdminSettingsBanner from "@/pages/admin/settings/Banner";
import AdminSettingsAbout from "@/pages/admin/settings/About";
import AdminSettingsBackup from "@/pages/admin/settings/Backup";
import AdminSettingsSharing from "@/pages/admin/settings/Sharing";
import AdminSettingsSocialLinks from "@/pages/admin/settings/SocialLinks";
import { Navigate } from "react-router-dom";
import { AdminMedia } from "@/pages/admin/Media";
import { SettingsProvider } from "@/context/SettingsContext";
import { CodeCopyEnhancer } from "@/components/CodeCopyEnhancer";

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
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <CodeCopyEnhancer />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/posts" element={<PostsPage />} />
                <Route path="/posts/:slug" element={<PostPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                
                <Route path="/admin" element={<AdminRoutes />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="posts" element={<AdminPosts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="comments" element={<AdminComments />} />
                  <Route path="settings" element={<AdminSettingsLayout />}>
                    <Route index element={<Navigate to="site" replace />} />
                    <Route path="site" element={<AdminSettingsSite />} />
                    <Route path="banner" element={<AdminSettingsBanner />} />
                    <Route path="about" element={<AdminSettingsAbout />} />
                    <Route path="backup" element={<AdminSettingsBackup />} />
                    <Route path="sharing" element={<AdminSettingsSharing />} />
                    <Route path="social" element={<AdminSettingsSocialLinks />} />
                  </Route>
                  <Route path="media" element={<AdminMedia />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
        </SettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
