import { Navigate, Route, Routes } from 'react-router-dom';
import CommunityHeader from './components/CommunityHeader';
import CommunityFooter from './components/CommunityFooter';
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import SubmitArticlePage from './pages/SubmitArticlePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import './community.css';

export default function CommunityApp() {
  return (
    <div className="community-shell">
      <CommunityHeader />
      <main className="community-main">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="articles/:id" element={<ArticleDetailPage />} />
          <Route path="submit" element={<SubmitArticlePage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
          <Route path="admin" element={<AdminLoginPage />} />
          <Route path="admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="*" element={<Navigate to="/community" replace />} />
        </Routes>
      </main>
      <CommunityFooter />
    </div>
  );
}
