import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/Home/HomePage';
import ProjectsPage from '../pages/Projects/ProjectsPage';
import ProjectDetailPage from '../pages/ProjectDetail/ProjectDetailPage';
import AboutPage from '../pages/About/AboutPage';
import FAQPage from '../pages/FAQ/FAQPage';
import CommunityPage from '../pages/Community/CommunityPage';
import BlogPage from '../pages/Blog/BlogPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';

// Admin Imports
import AdminLayout from '../layouts/AdminLayout/AdminLayout';
import AdminDashboard from '../pages/Admin/Dashboard/AdminDashboard';
import PendingProjects from '../pages/Admin/Projects/PendingProjects';
import AdminCategories from '../pages/Admin/Categories/AdminCategories';
import AdminUsers from '../pages/Admin/Users/AdminUsers';

const AppRoutes = () => (
  <Routes>
    {/* Admin Routes */}
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="projects/pending" element={<PendingProjects />} />
      <Route path="categories" element={<AdminCategories />} />
      <Route path="users" element={<AdminUsers />} />
    </Route>

    {/* Public Routes */}
    <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:slug" element={<ProjectDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);
export default AppRoutes;