import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { AshaConnect } from './components/AshaConnect';
import { AdminDashboard } from './components/AdminDashboard';

/* 🧠 AskBot UI */
import { AshaChatbot } from './components/AshaChatbot';
import { FloatingAskBot } from './components/FloatingAskBot';

export default function App() {
  const [user, setUser] = useState<{
    userId: string;
    role: string;
    name: string;
  } | null>(null);

  /* 🔹 AskBot state */
  const [showAskBot, setShowAskBot] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('ashaUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: {
    userId: string;
    role: string;
    name: string;
  }) => {
    setUser(userData);
    localStorage.setItem('ashaUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ashaUser');
  };

  /* =============================
     🔹 AUTH ROUTING (UNCHANGED)
     ============================= */

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.role === 'admin') {
    return (
      <>
        <AdminDashboard onLogout={handleLogout} />

        {/* 🧠 Floating AskBot */}
        <FloatingAskBot onClick={() => setShowAskBot(true)} />
        {showAskBot && (
          <AshaChatbot onClose={() => setShowAskBot(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <AshaConnect user={user} onLogout={handleLogout} />

      {/* 🧠 Floating AskBot */}
      <FloatingAskBot onClick={() => setShowAskBot(true)} />
      {showAskBot && (
        <AshaChatbot onClose={() => setShowAskBot(false)} />
      )}
    </>
  );
}
