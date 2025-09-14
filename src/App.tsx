import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AuthGuard from './components/AuthGuard';
import LoginPage from './components/LoginPage';
import CreatePoll from './components/CreatePoll';
import VotePage from './components/VotePage';
import ResultsPage from './components/ResultsPage';
import AdminPage from './components/AdminPage';
import AuthCallback from './components/AuthCallback';
import MyPage from './components/MyPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <CreatePoll />
              </AuthGuard>
            }
          />
          <Route
            path="/poll/:id"
            element={
              <AuthGuard>
                <VotePage />
              </AuthGuard>
            }
          />
          <Route path="/poll/:id/results" element={<ResultsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route
            path="/mypage"
            element={
              <AuthGuard>
                <MyPage />
              </AuthGuard>
            }
          />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;