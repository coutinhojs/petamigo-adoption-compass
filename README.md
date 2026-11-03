# Petamigo Adoption Compass

Crie um site chamado "PetAmigo JP" com um chatbot para ajudar pessoas a adotar animais e cuidar bem deles. Use Supabase como back-end. Visual amigável, em português do Brasil, responsivo para celular. PÁGINA PRINCIPAL (pública): - Janela de chat em tela cheia. O bot começa com boas-vindas e botões: "Quero adotar", "Cuidados básicos", "Posse responsável", "Falar com uma ONG". - "Quero adotar": o bot pergunta a espécie (cão ou gato) e o porte (pequeno, médio, grande), busca na tabela animais (status = disponivel) e mostra cards com foto, nome, idade e botão "Tenho interesse". - "Tenho interesse": o bot pede nome e contato (WhatsApp ou e-mail), valida e salva na tabela interesses. - "Cuidados básicos": o bot mostra botões de assuntos (vacinas, vermífugo, alimentação, castração, higiene). Também entende palavras-chave digitadas e responde com a resposta da tabela faq. - Se não entender, responde "Não entendi, mas posso ajudar com isto:" e mostra o menu. - Salve cada mensagem do usuário e do bot na tabela conversas. PAINEL ADMIN (/admin), com login por e-mail e senha (Supabase Auth): - CRUD de animais (nome, especie, porte, idade, descricao, foto_url, status). - CRUD do faq (categoria, palavras_chave, pergunta, resposta). - Lista dos interesses recebidos. SUPABASE: - Tabelas: animais, faq, interesses, conversas (campos conforme acima, com id e criado_em). - RLS: leitura pública de animais e faq; inserção pública em interesses e conversas; todo o resto apenas para usuários autenticados. - Insira dados de exemplo: 6 animais e 10 perguntas no faq.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eb82a10c-ff0e-4741-a2be-39b286decd50).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
