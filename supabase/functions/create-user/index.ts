// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Token não fornecido" }, 401);

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: authError } = await callerClient.auth.getUser();
    if (authError || !caller) return json({ error: "Token inválido" }, 401);

    const { data: callerProfile } = await callerClient
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single();

    if (callerProfile?.role !== "admin") {
      return json({ error: "Acesso negado — apenas Jarls" }, 403);
    }

    const { nome, login, senha, papel, classe_viking, avatar_url } = await req.json();

    if (!nome || !login || !senha) {
      return json({ error: "Nome, login e senha são obrigatórios" }, 400);
    }

    const loginClean = login.trim().toLowerCase().replace(/\s+/g, "");
    const email = `${loginClean}@heimdall.local`;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { full_name: nome },
    });

    if (createError) return json({ error: createError.message }, 400);

    await adminClient.from("profiles").insert({
      id: data.user.id,
      nome,
      email,
      login: loginClean,
      avatar_url: avatar_url || null,
      papel: papel || "Desenvolvedor",
      classe_viking: classe_viking || "Recruta",
      role: "user",
      xp: 0,
    });

    return json({ success: true, user: { id: data.user.id, login: loginClean, nome } });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
