import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import TimelinePage from './pages/TimelinePage';
import PeriodPage from './pages/PeriodPage';
import LensesPage from './pages/LensesPage';
import LensPage from './pages/LensPage';
import LabPage from './pages/LabPage';
import QuestionsPage from './pages/QuestionsPage';
import QuestionPage from './pages/QuestionPage';
import EntityPage from './pages/EntityPage';
import NotesPage from './pages/NotesPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<TimelinePage />} />
        <Route path="period/:slug" element={<PeriodPage />} />
        <Route path="era/:slug" element={<PeriodPage />} />
        <Route path="lenses" element={<LensesPage />} />
        <Route path="lenses/:slug" element={<LensPage />} />
        <Route path="lab" element={<LabPage />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="questions/:slug" element={<QuestionPage />} />
        <Route path="machine/:slug" element={<EntityPage />} />
        <Route path="entity/:slug" element={<EntityPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="themes" element={<Navigate to="/lenses" replace />} />
        <Route path="themes/:slug" element={<Navigate to="/lenses" replace />} />
        <Route path="models" element={<Navigate to="/lab" replace />} />
        <Route path="ai" element={<Navigate to="/lab" replace />} />
        <Route path="ai/:slug" element={<Navigate to="/lab" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
