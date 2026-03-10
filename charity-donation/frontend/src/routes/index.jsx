import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/Home/HomePage';
import ProjectsPage from '../pages/Projects/ProjectsPage';
import ProjectDetailPage from '../pages/ProjectDetail/ProjectDetailPage';
import AboutPage from '../pages/About/AboutPage';
import FAQPage from '../pages/FAQ/FAQPage';
import CommunityPage from '../pages/Community/CommunityPage';
import BlogPage from '../pages/Blog/BlogPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';
import SignInPage from '../pages/SignIn/SignInPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/signin" element={<SignInPage />} />
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