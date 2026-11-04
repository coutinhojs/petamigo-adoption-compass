# PetAmigo JP

Chatbot de adoção responsável e orientação sobre cuidados básicos com animais de estimação, desenvolvido para o projeto **KeepChat - Capacitação em Inteligência Artificial** (FapesQ-PB, 2026.2).

**Autor:** Marcos Vinicius Da Silva Coutinho

## O que é

O PetAmigo JP é um site com um chatbot que ajuda pessoas a adotar animais e cuidar bem deles. O usuário conversa com o bot por menu e botões, vê os animais disponíveis, tira dúvidas sobre cuidados básicos e registra interesse em adotar. A ONG ou o protetor usa um painel com login para manter os dados atualizados.

## Funcionalidades

- Menu inicial com as opções: Quero adotar, Cuidados básicos, Posse responsável e Falar com uma ONG
- Lista de animais disponíveis com foto, idade e porte, com filtro por espécie e porte
- Respostas sobre vacinas, vermífugo, alimentação, castração e higiene a partir de um FAQ
- Registro de interesse em adotar (nome e contato)
- Histórico de conversas salvo no banco
- Painel administrativo (`/admin`) com login para gerenciar animais, FAQ e interesses
- Resposta padrão quando o bot não entende a pergunta

## Tecnologias

- [Lovable](https://lovable.dev): geração do site e da interface
- React e TypeScript: front-end
- [Supabase](https://supabase.com): banco de dados PostgreSQL, autenticação e regras de segurança (RLS)

## Como rodar localmente

Requisitos: Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Depois abra o endereço mostrado no terminal. O painel administrativo fica em `/admin`.

## Banco de dados

O projeto usa o Supabase **jamxteyptuvoduvsvwcs**, configurado em `src/lib/supabase.ts`. Esse arquivo usa apenas a URL do projeto e a chave pública (publishable), que podem ficar no front-end. Nenhuma chave secreta é usada ou publicada neste repositório.

Para criar o banco em um projeto Supabase novo:

1. Abra o **SQL Editor** do seu projeto no Supabase.
2. Cole o conteúdo de `supabase/schema.sql` e clique em **Run** (uma vez só, pois os dados de exemplo são inseridos junto).
3. Em **Authentication → Users**, crie o usuário administrador (e-mail e senha) para entrar em `/admin`.
4. Atualize a URL e a chave pública em `src/lib/supabase.ts` para as do seu projeto.

O `schema.sql` cria as tabelas `animais`, `faq`, `interesses` e `conversas`, ativa o RLS e insere 6 animais e 10 perguntas de exemplo.

### Arquivos gerados automaticamente

Os arquivos `.env`, `supabase/config.toml` e `src/integrations/supabase/` são gerados automaticamente pelo Lovable e **não são usados pelo app**. Eles podem mencionar outro ID de projeto Supabase (um backend criado pela plataforma), que está vazio e pode ser ignorado.
