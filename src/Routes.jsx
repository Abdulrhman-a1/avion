import { Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import CommunityApp from './community/CommunityApp.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/community/*" element={<CommunityApp />} />
    </Routes>
  );
}
