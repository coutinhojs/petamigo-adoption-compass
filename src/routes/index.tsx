import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PawPrint, Send, Heart, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { buscarFaq, validarContato, validarNome, type FaqItem } from "@/lib/bot";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PetAmigo JP — Adote e cuide bem do seu pet" },
      { name: "description", content: "Converse com o PetAmigo JP para adotar um cão ou gato e aprender cuidados básicos e posse responsável." },
      { property: "og:title", content: "PetAmigo JP — Adote e cuide bem do seu pet" },
      { property: "og:description", content: "Chatbot amigo para adoção responsável de cães e gatos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

type Animal = { id: string; nome: string; especie: string; porte: string; idade: string; descricao: string; foto_url: string };
type Acao = { label: string; acao: string };
type Msg = { id: number; autor: "bot" | "usuario"; texto: string; botoes?: Acao[]; animais?: Animal[] };
type Etapa =
  | { tipo: "livre" }
  | { tipo: "porte"; especie: string }
  | { tipo: "nome"; animal: Animal }
  | { tipo: "contato"; animal: Animal; nome: string };

const MENU: Acao[] = [
  { label: "🐾 Quero adotar", acao: "adotar" },
  { label: "🩺 Cuidados básicos", acao: "cuidados" },
  { label: "💛 Posse responsável", acao: "posse" },
  { label: "🏠 Falar com uma ONG", acao: "ong" },
];
const CUIDADOS: Acao[] = [
  { label: "Vacinas", acao: "faq:vacinas" },
  { label: "Vermífugo", acao: "faq:vermifugo" },
  { label: "Alimentação", acao: "faq:alimentacao" },
  { label: "Castração", acao: "faq:castracao" },
  { label: "Higiene", acao: "faq:higiene" },
];
const PORTE_LABEL: Record<string, string> = { pequeno: "Pequeno", medio: "Médio", grande: "Grande" };

let contador = 0;

function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [texto, setTexto] = useState("");
  const [etapa, setEtapa] = useState<Etapa>({ tipo: "livre" });
  const faqsRef = useRef<FaqItem[]>([]);
  const sessaoRef = useRef<string>("");
  const iniciou = useRef(false);
  const fimRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const salvar = (autor: "bot" | "usuario", mensagem: string) => {
    if (!sessaoRef.current) return;
    supabase
      .from("conversas")
      .insert({ sessao_id: sessaoRef.current, autor, mensagem: mensagem.slice(0, 4000) })
      .then(({ error }) => error && console.error("Erro ao salvar conversa", error));
  };

  const bot = (texto: string, extra: Partial<Msg> = {}) => {
    setMsgs((m) => [...m, { id: ++contador, autor: "bot", texto, ...extra }]);
    salvar("bot", texto + (extra.animais ? ` [${extra.animais.map((a) => a.nome).join(", ")}]` : ""));
  };
  const usuario = (texto: string) => {
    setMsgs((m) => [...m, { id: ++contador, autor: "usuario", texto }]);
    salvar("usuario", texto);
  };

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;
    sessaoRef.current = crypto.randomUUID();
    supabase.from("faq").select("*").then(({ data }) => (faqsRef.current = data ?? []));
    bot("Olá! Eu sou o PetAmigo JP 🐶🐱 Estou aqui para ajudar você a adotar um amigo e cuidar bem dele. Como posso ajudar?", { botoes: MENU });
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const respostaFaq = (categoria: string) => {
    const itens = faqsRef.current.filter((f) => f.categoria === categoria);
    if (!itens.length) return bot("Ainda não tenho informações sobre isso.", { botoes: MENU });
    itens.forEach((f, i) =>
      bot(`**${f.pergunta}**\n${f.resposta}`, i === itens.length - 1 ? { botoes: [...CUIDADOS, { label: "Menu", acao: "menu" }] } : {}),
    );
  };

  const buscarAnimais = async (especie: string, porte: string) => {
    const { data, error } = await supabase
      .from("animais")
      .select("*")
      .eq("status", "disponivel")
      .eq("especie", especie)
      .eq("porte", porte)
      .order("criado_em");
    if (error) return bot("Ops, não consegui buscar os animais agora. Tente de novo.", { botoes: MENU });
    if (!data?.length)
      return bot(`No momento não há ${especie === "cao" ? "cães" : "gatos"} de porte ${(PORTE_LABEL[porte] ?? porte).toLowerCase()} disponíveis. Quer tentar outro porte?`, {
        botoes: [{ label: "Escolher de novo", acao: "adotar" }, { label: "Menu", acao: "menu" }],
      });
    bot(`Encontrei ${data.length} amigo(s) esperando por um lar:`, { animais: data });
  };

  const executar = (acao: string, label?: string) => {
    if (label) usuario(label);
    if (acao === "menu") {
      setEtapa({ tipo: "livre" });
      return bot("Em que mais posso ajudar?", { botoes: MENU });
    }
    if (acao === "adotar") {
      setEtapa({ tipo: "livre" });
      return bot("Que legal! 🥰 Você prefere cão ou gato?", {
        botoes: [{ label: "🐶 Cão", acao: "especie:cao" }, { label: "🐱 Gato", acao: "especie:gato" }],
      });
    }
    if (acao.startsWith("especie:")) {
      const especie = acao.split(":")[1] ?? "cao";
      setEtapa({ tipo: "porte", especie });
      return bot("E qual porte?", {
        botoes: ["pequeno", "medio", "grande"].map((p) => ({ label: PORTE_LABEL[p] ?? p, acao: `porte:${especie}:${p}` })),
      });
    }
    if (acao.startsWith("porte:")) {
      const [, especie = "cao", porte = "medio"] = acao.split(":");
      setEtapa({ tipo: "livre" });
      return void buscarAnimais(especie, porte);
    }
    if (acao === "cuidados") return bot("Sobre qual assunto você quer saber? Você também pode digitar sua dúvida.", { botoes: CUIDADOS });
    if (acao.startsWith("faq:")) return respostaFaq(acao.split(":")[1] ?? "");
    if (acao === "posse") return respostaFaq("posse");
    if (acao === "ong") return respostaFaq("ong");
  };

  const interesse = (a: Animal) => {
    usuario(`Tenho interesse no(a) ${a.nome}!`);
    setEtapa({ tipo: "nome", animal: a });
    bot(`Que maravilha! 💛 Para falarmos sobre o(a) ${a.nome}, qual é o seu nome?`);
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const t = texto.trim();
    if (!t) return;
    setTexto("");
    usuario(t);
    inputRef.current?.focus();

    if (etapa.tipo === "nome") {
      if (!validarNome(t)) return bot("Por favor, digite um nome válido (2 a 100 letras).");
      setEtapa({ tipo: "contato", animal: etapa.animal, nome: t });
      return bot(`Prazer, ${t}! Agora me passe seu WhatsApp (com DDD) ou e-mail.`);
    }
    if (etapa.tipo === "contato") {
      const c = validarContato(t);
      if (!c.ok) return bot("Hmm, não parece um WhatsApp (com DDD) ou e-mail válido. Pode tentar de novo?");
      const { error } = await supabase.from("interesses").insert({ animal_id: etapa.animal.id, nome: etapa.nome, contato: c.valor });
      setEtapa({ tipo: "livre" });
      if (error) return bot("Não consegui registrar seu interesse agora. Tente novamente em instantes.", { botoes: MENU });
      return bot(`Pronto, ${etapa.nome}! Registramos seu interesse no(a) ${etapa.animal.nome}. A equipe entrará em contato em breve. 🐾`, { botoes: MENU });
    }
    const n = t.toLowerCase();
    if (/adot/.test(n)) return executar("adotar");
    if (etapa.tipo === "porte") {
      const p = /peq/.test(n) ? "pequeno" : /m[eé]d/.test(n) ? "medio" : /grand/.test(n) ? "grande" : null;
      if (p) return executar(`porte:${etapa.especie}:${p}`);
    }
    const f = buscarFaq(t, faqsRef.current);
    if (f) return bot(`**${f.pergunta}**\n${f.resposta}`, { botoes: [{ label: "Menu", acao: "menu" }] });
    bot("Não entendi, mas posso ajudar com isto:", { botoes: MENU });
  };

  return (
    <div className="flex h-dvh flex-col bg-background bg-paws">
      <header className="flex items-center justify-between border-b bg-card/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
            <PawPrint className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">PetAmigo JP</h1>
            <p className="text-xs text-muted-foreground">Adoção e cuidados com carinho</p>
          </div>
        </div>
        <Link to="/admin" className="text-muted-foreground hover:text-foreground" aria-label="Área administrativa">
          <Lock className="size-4" />
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {msgs.map((m) => (
            <div key={m.id} className={m.autor === "usuario" ? "flex justify-end" : "flex flex-col items-start gap-2"}>
              <div
                className={
                  m.autor === "usuario"
                    ? "max-w-[85%] rounded-2xl rounded-br-sm bg-bubble-user px-4 py-2 text-bubble-user-foreground"
                    : "max-w-[90%] whitespace-pre-line rounded-2xl rounded-bl-sm border bg-bubble-bot px-4 py-2 shadow-sm"
                }
              >
                <Rich texto={m.texto} />
              </div>
              {m.animais && (
                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                  {m.animais.map((a) => (
                    <div key={a.id} className="overflow-hidden rounded-2xl border bg-card shadow-soft">
                      {a.foto_url && <img src={a.foto_url} alt={a.nome} className="aspect-[4/3] w-full object-cover" loading="lazy" />}
                      <div className="space-y-2 p-3">
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-lg font-semibold">{a.nome}</h3>
                          <span className="text-sm text-muted-foreground">{a.idade}</span>
                        </div>
                        {a.descricao && <p className="text-sm text-muted-foreground">{a.descricao}</p>}
                        <Button className="w-full rounded-full" onClick={() => interesse(a)}>
                          <Heart className="size-4" /> Tenho interesse
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {m.botoes && (
                <div className="flex flex-wrap gap-2">
                  {m.botoes.map((b) => (
                    <Button key={b.acao} variant="outline" size="sm" className="rounded-full border-primary/40 bg-card" onClick={() => executar(b.acao, b.label)}>
                      {b.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={fimRef} />
        </div>
      </main>

      <form onSubmit={enviar} className="border-t bg-card/90 px-3 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            ref={inputRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={500}
            placeholder="Digite sua mensagem…"
            className="flex-1 rounded-full border bg-background px-4 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" size="icon" className="size-10 rounded-full" aria-label="Enviar">
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function Rich({ texto }: { texto: string }) {
  const partes = texto.split(/\*\*(.+?)\*\*/g);
  return <>{partes.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}</>;
}
