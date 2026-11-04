import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { PawPrint, Pencil, Trash2, Plus, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel Admin — PetAmigo JP" },
      { name: "description", content: "Gerencie animais, perguntas frequentes e interesses de adoção do PetAmigo JP." },
      { property: "og:title", content: "Painel Admin — PetAmigo JP" },
      { property: "og:description", content: "Área administrativa do PetAmigo JP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (carregando) return <div className="p-8 text-center text-muted-foreground">Carregando…</div>;

  return (
    <div className="min-h-dvh bg-background bg-paws">
      <Toaster />
      <header className="flex items-center justify-between border-b bg-card px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <PawPrint className="size-5 text-primary" /> PetAmigo JP · Admin
        </Link>
        {session && (
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
            <LogOut className="size-4" /> Sair
          </Button>
        )}
      </header>
      {session ? <Painel /> : <Login />}
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setEnviando(false);
    if (error) setErro("E-mail ou senha incorretos.");
  };
  return (
    <form onSubmit={entrar} className="mx-auto mt-16 max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
      <h2 className="text-2xl font-semibold">Entrar</h2>
      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="senha">Senha</Label>
        <Input id="senha" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
      </div>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <Button type="submit" className="w-full" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}

function Painel() {
  return (
    <div className="mx-auto max-w-5xl p-4">
      <Tabs defaultValue="animais">
        <TabsList>
          <TabsTrigger value="animais">Animais</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="interesses">Interesses</TabsTrigger>
        </TabsList>
        <TabsContent value="animais"><Crud tabela="animais" campos={CAMPOS_ANIMAIS} titulo={(r) => `${r.nome} · ${r.especie} · ${r.porte} · ${r.status}`} /></TabsContent>
        <TabsContent value="faq"><Crud tabela="faq" campos={CAMPOS_FAQ} titulo={(r) => `[${r.categoria}] ${r.pergunta}`} /></TabsContent>
        <TabsContent value="interesses"><Interesses /></TabsContent>
      </Tabs>
    </div>
  );
}

type Campo = { nome: string; label: string; tipo?: "texto" | "area" | "select"; opcoes?: string[]; obrigatorio?: boolean };
const CAMPOS_ANIMAIS: Campo[] = [
  { nome: "nome", label: "Nome", obrigatorio: true },
  { nome: "especie", label: "Espécie", tipo: "select", opcoes: ["cao", "gato"] },
  { nome: "porte", label: "Porte", tipo: "select", opcoes: ["pequeno", "medio", "grande"] },
  { nome: "idade", label: "Idade" },
  { nome: "descricao", label: "Descrição", tipo: "area" },
  { nome: "foto_url", label: "URL da foto" },
  { nome: "status", label: "Status", tipo: "select", opcoes: ["disponivel", "reservado", "adotado"] },
];
const CAMPOS_FAQ: Campo[] = [
  { nome: "categoria", label: "Categoria (vacinas, vermifugo, alimentacao, castracao, higiene, posse, ong)", obrigatorio: true },
  { nome: "palavras_chave", label: "Palavras-chave (separadas por vírgula)" },
  { nome: "pergunta", label: "Pergunta", obrigatorio: true },
  { nome: "resposta", label: "Resposta", tipo: "area", obrigatorio: true },
];

type Linha = { [k: string]: string | undefined; id?: string; nome?: string; especie?: string; porte?: string; status?: string; categoria?: string; pergunta?: string };

function Crud({ tabela, campos, titulo }: { tabela: "animais" | "faq"; campos: Campo[]; titulo: (r: Linha) => string }) {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [edit, setEdit] = useState<Linha | null>(null);

  const carregar = async () => {
    const { data, error } = await supabase.from(tabela).select("*").order("criado_em", { ascending: false });
    if (error) toast.error(error.message);
    else
      setLinhas(
        (data ?? []).map((r) => ({
          ...r,
          palavras_chave: Array.isArray(r.palavras_chave) ? r.palavras_chave.join(", ") : r.palavras_chave,
        })) as unknown as Linha[],
      );
  };
  useEffect(() => { void carregar(); }, [tabela]);

  const novo = () => setEdit(Object.fromEntries(campos.map((c) => [c.nome, c.opcoes?.[0] ?? ""])));

  const salvar = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!edit) return;
    const dados = Object.fromEntries(
      campos.map((c) => {
        const valor = (edit[c.nome] ?? "").trim();
        // palavras_chave é text[] no banco: converte a lista separada por vírgula
        if (c.nome === "palavras_chave") return [c.nome, valor.split(",").map((p) => p.trim()).filter(Boolean)];
        return [c.nome, valor];
      }),
    );
    const { error } = edit.id
      ? await supabase.from(tabela).update(dados as never).eq("id", edit.id)
      : await supabase.from(tabela).insert(dados as never);
    if (error) { toast.error(error.message); return; }
    toast.success("Salvo!");
    setEdit(null);
    void carregar();
  };

  const excluir = async (id: string): Promise<void> => {
    if (!confirm("Excluir este registro?")) return;
    const { error } = await supabase.from(tabela).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    void carregar();
  };

  return (
    <div className="mt-4 space-y-4">
      {edit ? (
        <form onSubmit={salvar} className="space-y-3 rounded-2xl border bg-card p-4 shadow-soft">
          {campos.map((c) => (
            <div key={c.nome} className="space-y-1">
              <Label>{c.label}</Label>
              {c.tipo === "area" ? (
                <Textarea required={c.obrigatorio} value={edit[c.nome] ?? ""} onChange={(e) => setEdit({ ...edit, [c.nome]: e.target.value })} />
              ) : c.tipo === "select" ? (
                <select className="w-full rounded-md border bg-background px-3 py-2" value={edit[c.nome]} onChange={(e) => setEdit({ ...edit, [c.nome]: e.target.value })}>
                  {c.opcoes!.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <Input required={c.obrigatorio} value={edit[c.nome] ?? ""} onChange={(e) => setEdit({ ...edit, [c.nome]: e.target.value })} />
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="submit">Salvar</Button>
            <Button type="button" variant="outline" onClick={() => setEdit(null)}>Cancelar</Button>
          </div>
        </form>
      ) : (
        <Button onClick={novo}><Plus className="size-4" /> Novo</Button>
      )}
      <ul className="divide-y rounded-2xl border bg-card">
        {linhas.map((r) => (
          <li key={r.id ?? ""} className="flex items-center justify-between gap-2 p-3">
            <span className="min-w-0 truncate text-sm">{titulo(r)}</span>
            <div className="flex shrink-0 gap-1">
              <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => setEdit(r)}><Pencil className="size-4" /></Button>
              <Button size="icon" variant="ghost" aria-label="Excluir" onClick={() => r.id && excluir(r.id)}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          </li>
        ))}
        {!linhas.length && <li className="p-4 text-sm text-muted-foreground">Nenhum registro.</li>}
      </ul>
    </div>
  );
}

function Interesses() {
  type Interesse = { id: string; nome: string; contato: string; mensagem: string | null; criado_em: string; animal: string | null };
  const [linhas, setLinhas] = useState<Interesse[]>([]);
  useEffect(() => {
    supabase
      .from("interesses")
      .select("id,nome,contato,mensagem,criado_em,animais(nome)")
      .order("criado_em", { ascending: false })
      .then(({ data, error }) => {
        if (error) return toast.error(error.message);
        setLinhas(
          (data ?? []).map((l) => {
            const rel = l.animais as { nome: string } | { nome: string }[] | null;
            const animal = Array.isArray(rel) ? (rel[0]?.nome ?? null) : (rel?.nome ?? null);
            return { id: l.id, nome: l.nome, contato: l.contato, mensagem: l.mensagem, criado_em: l.criado_em, animal };
          }),
        );
      });
  }, []);
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left">
          <tr><th className="p-3">Data</th><th className="p-3">Nome</th><th className="p-3">Contato</th><th className="p-3">Animal</th><th className="p-3">Mensagem</th></tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="p-3">{new Date(l.criado_em).toLocaleString("pt-BR")}</td>
              <td className="p-3">{l.nome}</td>
              <td className="p-3">{l.contato}</td>
              <td className="p-3">{l.animal ?? "—"}</td>
              <td className="p-3">{l.mensagem ?? "—"}</td>
            </tr>
          ))}
          {!linhas.length && <tr><td colSpan={5} className="p-4 text-muted-foreground">Nenhum interesse ainda.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
