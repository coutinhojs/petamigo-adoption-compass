export type FaqItem = {
  id: string;
  categoria: string;
  palavras_chave: string;
  pergunta: string;
  resposta: string;
};

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Encontra a FAQ cuja palavra-chave aparece no texto (a mais longa vence). */
export function buscarFaq(texto: string, faqs: FaqItem[]): FaqItem | null {
  const t = normalizar(texto);
  if (!t) return null;
  let melhor: FaqItem | null = null;
  let tamanho = 0;
  for (const f of faqs) {
    for (const kw of f.palavras_chave.split(",")) {
      const k = normalizar(kw);
      if (k.length >= 3 && t.includes(k) && k.length > tamanho) {
        melhor = f;
        tamanho = k.length;
      }
    }
  }
  return melhor;
}

export type ContatoValido = { ok: true; valor: string } | { ok: false };

/** Aceita e-mail ou WhatsApp brasileiro (10 a 13 dígitos). */
export function validarContato(entrada: string): ContatoValido {
  const v = entrada.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 255) return { ok: true, valor: v };
  const digitos = v.replace(/\D/g, "");
  if (/^[\d\s()+-]+$/.test(v) && digitos.length >= 10 && digitos.length <= 13)
    return { ok: true, valor: digitos };
  return { ok: false };
}

export function validarNome(entrada: string): boolean {
  const v = entrada.trim();
  return v.length >= 2 && v.length <= 100;
}
