import { describe, it, expect } from "vitest";
import { buscarFaq, validarContato, validarNome } from "@/lib/bot";

const faqs = [
  { id: "1", categoria: "vacinas", palavras_chave: ["vacina", "raiva"], pergunta: "", resposta: "A" },
  { id: "2", categoria: "castracao", palavras_chave: ["castração", "castrar"], pergunta: "", resposta: "B" },
];

describe("bot", () => {
  it("encontra faq por palavra-chave sem acento", () => {
    expect(buscarFaq("quando devo CASTRACAO?", faqs)?.id).toBe("2");
    expect(buscarFaq("meu cão precisa de vacina?", faqs)?.id).toBe("1");
  });
  it("retorna null quando não entende", () => {
    expect(buscarFaq("qual a cor do céu", faqs)).toBeNull();
  });
  it("aceita e-mail e WhatsApp", () => {
    expect(validarContato("ana@email.com").ok).toBe(true);
    expect(validarContato("(11) 98765-4321")).toEqual({ ok: true, valor: "11987654321" });
  });
  it("rejeita contato inválido", () => {
    expect(validarContato("1234").ok).toBe(false);
    expect(validarContato("ana@").ok).toBe(false);
  });
  it("exige nome com ao menos 2 letras", () => {
    expect(validarNome("A")).toBe(false);
    expect(validarNome("Ana")).toBe(true);
  });
});
