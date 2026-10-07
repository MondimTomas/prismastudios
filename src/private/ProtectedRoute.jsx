import { useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({
  children,
  requiredRole = null,
  loginPath = "/tomasmondim/login",
}) {
  const location = useLocation();
  const { workspaceSlug } = useParams();
  const [session, setSession] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function resolveAccess(nextSession) {
      if (!active) return;

      setSession(nextSession);

      if (!nextSession) {
        setMember(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("workspace_members")
        .select("role,status,workspace_slug")
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
        to={loginPath}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!member) {
    return <Navigate to={loginPath} replace />;
  }

  if (requiredRole && member.role !== requiredRole) {
    if (member.role === "owner") {
      return <Navigate to="/tomasmondim/admin" replace />;
    }

    if (member.role === "collaborator" && member.workspace_slug) {
      return <Navigate to={"/tomasmondim/" + member.workspace_slug} replace />;
    }

    return <Navigate to={loginPath} replace />;
  }

  if (
    requiredRole === "collaborator" &&
    workspaceSlug &&
    member.workspace_slug !== workspaceSlug
  ) {
    return <Navigate to={"/tomasmondim/" + member.workspace_slug} replace />;
  }

  return children;
}
