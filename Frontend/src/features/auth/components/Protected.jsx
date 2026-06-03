import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const Protected = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="border-b border-neutral-800 pb-6 mb-8 flex justify-between items-center">
          <h1 className="font-serif text-3xl tracking-[0.3em] uppercase">S N I T C H</h1>
          <div className="text-right">
            <p className="text-neutral-400 text-xs uppercase tracking-wider">Logged in as</p>
            <p className="font-semibold text-white">{user.fullName}</p>
          </div>
        </header>
        <main className="bg-[#1c1c1c] border border-neutral-900 p-8 shadow-2xl">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Protected;
