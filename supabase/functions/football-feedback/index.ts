import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://prismastudios.pt",
  "https://www.prismastudios.pt",
  "https://prismastudios.vercel.app",
  "http://localhost:5173",
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin)
      ? origin
      : "https://prismastudios.pt",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(req),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function cleanOptionalText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 1500) : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  if (req.method !== "POST") {
    return json(req, { error: "Método não suportado." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !serviceRoleKey) {
      return json(req, { error: "Configuração indisponível." }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json();
    const action = body?.action;
    const token = typeof body?.token === "string" ? body.token.trim() : "";

    if (!token) {
      return json(req, { error: "Link de avaliação inválido." }, 400);
    }

    const { data: form, error: formError } = await admin
      .from("workspace_football_feedback_forms")
      .select("job_id,is_active")
      .eq("token", token)
      .maybeSingle();

    if (formError) {
      console.error("feedback form lookup failed", formError);
      return json(req, { error: "Não foi possível abrir a avaliação." }, 500);
    }

    if (!form?.is_active) {
      return json(
        req,
        { error: "Este formulário de avaliação não está disponível." },
        404
      );
    }

    const { data: job, error: jobError } = await admin
      .from("workspace_jobs")
      .select(
        "id,title,client_name,job_date,status,business_line,team_id,football_teams(name)"
      )
      .eq("id", form.job_id)
      .maybeSingle();

    if (jobError) {
      console.error("feedback job lookup failed", jobError);
      return json(req, { error: "Não foi possível abrir a avaliação." }, 500);
    }

    if (!job || job.business_line !== "futebol" || job.status === "cancelled") {
      return json(
        req,
        { error: "Este formulário de avaliação não está disponível." },
        404
      );
    }

    if (action === "get") {
      return json(req, {
        job: {
          id: job.id,
          title: job.title,
          client_name: job.client_name,
          team_name: job.football_teams?.name || job.client_name,
          job_date: job.job_date,
          can_submit: job.job_date <= new Date().toISOString().slice(0, 10),
        },
      });
    }

    if (action === "submit") {
      const score = Number(body?.score);

      if (!Number.isInteger(score) || score < 0 || score > 10) {
        return json(req, { error: "Escolhe uma nota entre 0 e 10." }, 400);
      }

      if (job.job_date > new Date().toISOString().slice(0, 10)) {
        return json(
          req,
          { error: "A avaliação fica disponível depois do jogo." },
          400
        );
      }

      const { data: feedback, error: insertError } = await admin
        .from("workspace_football_feedback")
        .insert({
          job_id: job.id,
          score,
          liked: cleanOptionalText(body?.liked),
          disliked: cleanOptionalText(body?.disliked),
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("feedback insert failed", insertError);
        return json(req, { error: "Não foi possível enviar a avaliação." }, 500);
      }

      return json(req, { ok: true, id: feedback.id }, 201);
    }

    return json(req, { error: "Ação inválida." }, 400);
  } catch (error) {
    console.error("football-feedback unhandled error", error);
    return json(req, { error: "Ocorreu um erro. Tenta novamente." }, 500);
  }
});
