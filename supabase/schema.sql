-- =============================================================
-- PetAmigo JP — esquema completo do banco de dados
-- Cole este arquivo inteiro no SQL Editor do seu projeto Supabase
-- (SQL Editor → New query → colar → Run).
-- =============================================================

-- ---------- TABELAS ----------

create table if not exists public.animais (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  especie text not null check (especie in ('cao', 'gato')),
  porte text not null check (porte in ('pequeno', 'medio', 'grande')),
  idade text not null default '',
  descricao text not null default '',
  foto_url text not null default '',
  status text not null default 'disponivel' check (status in ('disponivel', 'reservado', 'adotado')),
  criado_em timestamptz not null default now()
);

create table if not exists public.faq (
  id uuid primary key default gen_random_uuid(),
  categoria text not null,
  palavras_chave text[] not null default '{}',
  pergunta text not null,
  resposta text not null,
  criado_em timestamptz not null default now()
);

create table if not exists public.interesses (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid references public.animais(id) on delete set null,
  nome text not null,
  contato text not null,
  mensagem text,
  criado_em timestamptz not null default now()
);

create table if not exists public.conversas (
  id uuid primary key default gen_random_uuid(),
  sessao_id text not null,
  mensagem_usuario text not null default '',
  resposta_bot text not null default '',
  criado_em timestamptz not null default now()
);

-- ---------- PERMISSÕES (GRANT) ----------

grant select on public.animais to anon, authenticated;
grant insert, update, delete on public.animais to authenticated;

grant select on public.faq to anon, authenticated;
grant insert, update, delete on public.faq to authenticated;

grant insert on public.interesses to anon;
grant select, insert, update, delete on public.interesses to authenticated;

grant insert on public.conversas to anon;
grant select, insert, update, delete on public.conversas to authenticated;

-- ---------- RLS ----------

alter table public.animais enable row level security;
alter table public.faq enable row level security;
alter table public.interesses enable row level security;
alter table public.conversas enable row level security;

-- animais: leitura pública; escrita só autenticada
drop policy if exists "leitura publica animais" on public.animais;
create policy "leitura publica animais" on public.animais
  for select to anon, authenticated using (true);
drop policy if exists "auth gerencia animais" on public.animais;
create policy "auth gerencia animais" on public.animais
  for all to authenticated using (true) with check (true);

-- faq: leitura pública; escrita só autenticada
drop policy if exists "leitura publica faq" on public.faq;
create policy "leitura publica faq" on public.faq
  for select to anon, authenticated using (true);
drop policy if exists "auth gerencia faq" on public.faq;
create policy "auth gerencia faq" on public.faq
  for all to authenticated using (true) with check (true);

-- interesses: inserção pública (com validação básica); leitura só autenticada
drop policy if exists "insercao publica interesses" on public.interesses;
create policy "insercao publica interesses" on public.interesses
  for insert to anon, authenticated
  with check (
    length(trim(nome)) between 2 and 100
    and length(trim(contato)) between 5 and 255
  );
drop policy if exists "auth le interesses" on public.interesses;
create policy "auth le interesses" on public.interesses
  for select to authenticated using (true);
drop policy if exists "auth gerencia interesses" on public.interesses;
create policy "auth gerencia interesses" on public.interesses
  for update to authenticated using (true) with check (true);
drop policy if exists "auth exclui interesses" on public.interesses;
create policy "auth exclui interesses" on public.interesses
  for delete to authenticated using (true);

-- conversas: inserção pública (com validação básica); leitura só autenticada
drop policy if exists "insercao publica conversas" on public.conversas;
create policy "insercao publica conversas" on public.conversas
  for insert to anon, authenticated
  with check (length(sessao_id) between 8 and 100);
drop policy if exists "auth le conversas" on public.conversas;
create policy "auth le conversas" on public.conversas
  for select to authenticated using (true);
drop policy if exists "auth exclui conversas" on public.conversas;
create policy "auth exclui conversas" on public.conversas
  for delete to authenticated using (true);

-- ---------- DADOS DE EXEMPLO ----------

insert into public.animais (nome, especie, porte, idade, descricao, foto_url, status) values
  ('Luna', 'gato', 'pequeno', '1 ano', 'Gatinha dócil e brincalhona, adora um colo e já está castrada.', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', 'disponivel'),
  ('Thor', 'cao', 'grande', '2 anos', 'Cão leal e cheio de energia, ótimo para quem tem quintal e gosta de passeios.', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800', 'disponivel'),
  ('Mel', 'cao', 'pequeno', '3 anos', 'Cadela tranquila e carinhosa, convive bem com crianças e outros animais.', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800', 'disponivel'),
  ('Simba', 'gato', 'medio', '8 meses', 'Filhote curioso e esperto, já usa a caixinha de areia e come ração.', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800', 'disponivel'),
  ('Frida', 'cao', 'medio', '4 anos', 'Cadela de porte médio, muito obediente e adestrada nos comandos básicos.', 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=800', 'disponivel'),
  ('Mingau', 'gato', 'pequeno', '2 anos', 'Gato branco e calmo, ideal para apartamento. Castrado e vacinado.', 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800', 'disponivel');

insert into public.faq (categoria, palavras_chave, pergunta, resposta) values
  ('vacinas', array['vacina', 'vacinas', 'raiva', 'v8', 'v10', 'imunizacao'], 'Quais vacinas meu pet precisa?', 'Cães: V8 ou V10 (anual) e antirrábica. Gatos: V4 ou V5 e antirrábica. Filhotes começam aos 45 dias com reforços a cada 21-30 dias. Consulte sempre um veterinário.'),
  ('vermifugo', array['vermifugo', 'verme', 'vermes', 'desverminacao'], 'De quanto em quanto tempo devo dar vermífugo?', 'Filhotes: a cada 15 dias até os 3 meses, depois mensal até os 6 meses. Adultos: a cada 3 a 6 meses, conforme orientação veterinária.'),
  ('alimentacao', array['alimentacao', 'racao', 'comida', 'comer', 'dieta'], 'Qual a melhor alimentação para meu pet?', 'Ração de qualidade adequada à idade e ao porte é a base. Água fresca sempre disponível. Evite chocolate, cebola, alho, uva e ossos cozidos — são tóxicos ou perigosos.'),
  ('castracao', array['castracao', 'castrar', 'castrado', 'esterilizacao'], 'Por que castrar meu pet?', 'A castração previne doenças (câncer, infecções), reduz fugas e marcação de território, e evita ninhadas indesejadas. Pode ser feita a partir dos 6 meses, com avaliação veterinária.'),
  ('higiene', array['higiene', 'banho', 'tosar', 'tosa', 'unha', 'limpeza'], 'Com que frequência devo dar banho?', 'Cães: banho a cada 15 a 30 dias. Gatos geralmente se limpam sozinhos. Escove os pelos regularmente, corte as unhas e limpe as orelhas com produtos adequados.'),
  ('posse', array['posse responsavel', 'responsabilidade', 'compromisso'], 'O que é posse responsável?', 'É garantir alimentação, saúde, abrigo, carinho e segurança por toda a vida do animal — que pode viver 15 anos ou mais. Adotar é um compromisso de longo prazo.'),
  ('posse', array['abandono', 'abandonar', 'crime'], 'Abandonar animais é crime?', 'Sim! Abandono e maus-tratos são crimes previstos na Lei de Crimes Ambientais (Lei 9.605/98) e na Lei Sansão (Lei 14.064/20), com pena de prisão.'),
  ('posse', array['identificacao', 'coleira', 'plaquinha', 'chip'], 'Meu pet precisa de identificação?', 'Sim! Coleira com plaquinha (nome e telefone) evita que ele se perca para sempre. Microchip é uma opção ainda mais segura.'),
  ('ong', array['ong', 'abrigo', 'protetor', 'zoonoses'], 'Como encontrar ONGs de proteção animal?', 'Procure o Centro de Zoonoses da sua cidade e grupos de protetores nas redes sociais. Em João Pessoa há várias ONGs que cuidam de resgate e adoção responsável.'),
  ('adocao', array['adocao', 'adotar', 'adotar um pet', 'quero adotar'], 'Como funciona a adoção responsável?', 'Você escolhe o animal, passa por uma entrevista simples, assina um termo de responsabilidade e recebe o pet vacinado e vermifugado. Algumas ONGs fazem visita de acompanhamento.');
