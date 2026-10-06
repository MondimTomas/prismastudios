import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151515] text-white flex items-center justify-center">
        <div className="text-sm text-white/50">A carregar workspace...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <Navigate
        to="/tomasmondim/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
