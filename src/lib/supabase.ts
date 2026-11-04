import { createClient } from "@supabase/supabase-js";

// Projeto Supabase do usuário (chave pública/publishable — segura para o front-end).
const SUPABASE_URL = "https://jamxteyptuvoduvsvwcs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Q1w1jcJdquLS-B6XoIhoOQ_MPizOFsX";

// Chaves sb_publishable_ são opacas (não são JWT): remove o Authorization duplicado
// e envia a chave apenas no header apikey, como o PostgREST espera.
function supabaseFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(
    typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
  );
  if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
  if (headers.get("Authorization") === `Bearer ${SUPABASE_PUBLISHABLE_KEY}`) {
    headers.delete("Authorization");
  }
  headers.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  return fetch(input, { ...init, headers });
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: { fetch: supabaseFetch },
  auth: { persistSession: true, autoRefreshToken: true },
});
