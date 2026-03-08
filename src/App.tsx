import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './routes';
import { AuthProvider } from './lib/auth';
import { useOnlineStatus } from './hooks/useOnlineStatus';

function OnlineStatusWatcher() {
  useOnlineStatus();
  return null;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <OnlineStatusWatcher />
      <RouterProvider router={router} />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </AuthProvider>
  );
};

export default App;