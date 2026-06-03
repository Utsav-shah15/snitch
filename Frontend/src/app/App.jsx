import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './auth.routes';
import { Provider } from 'react-redux';
import { store } from './app.store';
import { useAuth } from '../features/auth/hooks/useAuth';

const AppContent = () => {
  const { getMe } = useAuth();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        await getMe();
      } catch (err) {
        // Silent catch: if no token exists or is expired, the user remains unauthenticated
      } finally {
        setCheckingSession(false);
      }
    };
    initApp();
  }, []); // Run exactly once on mount

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center text-white">
        <svg className="animate-spin h-8 w-8 text-white mb-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="font-serif text-sm tracking-[0.25em] text-neutral-400 uppercase">Loading Snitch...</span>
      </div>
    );
  }

  return <RouterProvider router={router} />;
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
