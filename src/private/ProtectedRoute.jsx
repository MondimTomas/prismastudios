import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({
  children,
  requiredRole = null,
  loginPath = "/tomasmondim/login",
}) {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function resolveAccess(nextSession) {
      if (!active) return;

      setSession(nextSession);

      if (!nextSession || !requiredRole) {
        setMember(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("workspace_members")
        .select("role,status")
        .eq("user_id", nextSession.user.id)
        .maybeSingle();

      if (!active) return;
      setMember(data || null);
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => resolveAccess(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setLoading(true);
      resolveAccess(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [requiredRole]);

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
        to={loginPath}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (requiredRole && member?.role !== requiredRole) {
    if (member?.role === "owner") {
      return <Navigate to="/tomasmondim" replace />;
    }
    if (member?.role === "collaborator") {
      return <Navigate to="/equipa" replace />;
    }
    return <Navigate to={loginPath} replace />;
  }

  return children;
}
