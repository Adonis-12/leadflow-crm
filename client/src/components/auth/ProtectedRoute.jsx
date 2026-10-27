
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {
  getAccessToken,
  refreshAccessToken,
} from '../../services/api';

export default function ProtectedRoute() {
  const [status, setStatus] = useState(() =>
    getAccessToken() ? 'authenticated' : 'loading'
  );

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (getAccessToken()) {
        if (active) setStatus('authenticated');
        return;
      }

      try {
        await refreshAccessToken();

        if (active) setStatus('authenticated');
      } catch {
        if (active) setStatus('unauthenticated');
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Restoring your session...
        </p>
      </div>
    );
  }

  return status === 'authenticated'
    ? <Outlet />
    : <Navigate to="/login" replace />;
}
