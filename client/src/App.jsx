import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import SymptomChecker from './components/SymptomChecker';
import PatientHistory from './components/PatientHistory';
import AuthPage from './components/AuthPage';
import ResetPassword from './components/ResetPassword';
import api from './api';
import './App.css';

function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    user: null
  });
  const [view, setView] = useState('vaidya');
  const [loading, setLoading] = useState(true);
  const [resetToken, setResetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('resetToken');
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/api/auth/me')
      .then(res => {
        setAuth({ token, user: res.data.user });
      })
      .catch(() => {
        localStorage.removeItem('token');
        setAuth({ token: null, user: null });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAuth = payload => {
    localStorage.setItem('token', payload.token);
    setAuth({ token: payload.token, user: payload.user });
    setView('vaidya');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth({ token: null, user: null });
    setView('vaidya');
  };

  const clearResetToken = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('resetToken');
    window.history.replaceState({}, '', url);
    setResetToken(null);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="page-loading">Loading...</div>
      </div>
    );
  }

  if (resetToken) {
    return (
      <div className="app-container">
        <Navbar
          isAuthed={false}
          user={null}
          view="vaidya"
          onViewChange={() => {}}
          onLogout={() => {}}
        />
        <ResetPassword token={resetToken} onDone={clearResetToken} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        isAuthed={Boolean(auth.token)}
        user={auth.user}
        view={view}
        onViewChange={setView}
        onLogout={handleLogout}
      />

      {!auth.token ? (
        <>
          <AuthPage onAuth={handleAuth} />
          <SymptomChecker doctor={null} isAuthed={false} />
        </>
      ) : view === 'history' ? (
        <PatientHistory doctor={auth.user} />
      ) : (
        <SymptomChecker doctor={auth.user} isAuthed />
      )}
    </div>
  );
}

export default App;
