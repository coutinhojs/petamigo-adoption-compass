CREATE TABLE public.animais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  especie text NOT NULL CHECK (especie IN ('cao','gato')),
  porte text NOT NULL CHECK (porte IN ('pequeno','medio','grande')),
  idade text NOT NULL DEFAULT '',
  descricao text NOT NULL DEFAULT '',
  foto_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel','reservado','adotado')),
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.animais TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.animais TO authenticated;
GRANT ALL ON public.animais TO service_role;
ALTER TABLE public.animais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leitura publica animais" ON public.animais FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth gerencia animais ins" ON public.animais FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth gerencia animais upd" ON public.animais FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth gerencia animais del" ON public.animais FOR DELETE TO authenticated USING (true);

CREATE TABLE public.faq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria text NOT NULL,
  palavras_chave text NOT NULL DEFAULT '',
  pergunta text NOT NULL,
  resposta text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faq TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faq TO authenticated;
GRANT ALL ON public.faq TO service_role;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leitura publica faq" ON public.faq FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth faq ins" ON public.faq FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth faq upd" ON public.faq FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth faq del" ON public.faq FOR DELETE TO authenticated USING (true);

CREATE TABLE public.interesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES public.animais(id) ON DELETE SET NULL,
  nome text NOT NULL CHECK (char_length(nome) BETWEEN 2 AND 100),
  contato text NOT NULL CHECK (char_length(contato) BETWEEN 5 AND 255),
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.interesses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interesses TO authenticated;
GRANT ALL ON public.interesses TO service_role;
ALTER TABLE public.interesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insercao publica interesses" ON public.interesses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "auth le interesses" ON public.interesses FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth upd interesses" ON public.interesses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth del interesses" ON public.interesses FOR DELETE TO authenticated USING (true);

CREATE TABLE public.conversas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id text NOT NULL,
  autor text NOT NULL CHECK (autor IN ('usuario','bot')),
  mensagem text NOT NULL CHECK (char_length(mensagem) <= 4000),
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.conversas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversas TO authenticated;
GRANT ALL ON public.conversas TO service_role;
ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insercao publica conversas" ON public.conversas FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "auth le conversas" ON public.conversas FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth del conversas" ON public.conversas FOR DELETE TO authenticated USING (true);

INSERT INTO public.animais (nome, especie, porte, idade, descricao, foto_url) VALUES
('Thor','cao','grande','3 anos','Brincalhão, adora correr e é ótimo com crianças.','https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600'),
('Mel','cao','medio','2 anos','Carinhosa e calma, já castrada e vacinada.','https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600'),
('Pipoca','cao','pequeno','1 ano','Pequena e cheia de energia, ama colo.','https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600'),
('Luna','gato','pequeno','8 meses','Curiosa e independente, usa caixinha de areia.','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600'),
('Simba','gato','medio','2 anos','Tranquilo, gosta de dormir no sol.','https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600'),
('Bóris','gato','grande','4 anos','Gatão dócil e sociável com outros gatos.','https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600');

INSERT INTO public.faq (categoria, palavras_chave, pergunta, resposta) VALUES
('vacinas','vacina,vacinas,v8,v10,antirrabica,raiva','Quais vacinas meu pet precisa?','Cães precisam da V8/V10 (3 doses a partir de 45 dias) e antirrábica. Gatos tomam a V3/V4/V5 e antirrábica. Reforço anual com o veterinário.'),
('vacinas','filhote,quando vacinar,idade vacina','Quando começar a vacinar o filhote?','A partir de 6 a 8 semanas de vida, com doses a cada 21-30 dias. Evite passeios na rua até completar o protocolo.'),
('vermifugo','vermifugo,vermes,verme,vermífugo','De quanto em quanto tempo dar vermífugo?','Filhotes: a cada 15 dias até 6 meses. Adultos: a cada 3 a 6 meses, conforme orientação do veterinário.'),
('alimentacao','racao,ração,comida,alimentação,alimentacao','Qual a melhor alimentação?','Uma ração de boa qualidade (premium ou super premium) adequada à idade e porte, com água fresca sempre disponível.'),
('alimentacao','proibido,chocolate,uva,cebola,toxico','Quais alimentos são proibidos?','Nunca ofereça chocolate, uva, uva-passa, cebola, alho, abacate, café, álcool ou ossos cozidos. São tóxicos para cães e gatos.'),
('castracao','castracao,castração,castrar,cio','Por que castrar meu pet?','A castração evita ninhadas indesejadas, reduz fugas, previne tumores e doenças. Pode ser feita a partir dos 6 meses.'),
('higiene','banho,higiene,banhar','Com que frequência dar banho?','Cães: a cada 15-30 dias com shampoo próprio. Gatos se limpam sozinhos; banho só quando necessário.'),
('higiene','dente,dentes,escovar,unha,unhas','Como cuidar de dentes e unhas?','Escove os dentes com pasta veterinária 3x por semana e corte as unhas a cada 2-4 semanas, sem atingir a parte rosada.'),
('posse','posse responsavel,responsabilidade,abandono,posse','O que é posse responsável?','É garantir alimento, abrigo, saúde, carinho e identificação ao pet por toda a vida dele, sem abandono. Adotar é um compromisso de 10 a 20 anos!'),
('ong','ong,abrigo,doar,voluntario,voluntário','Como ajudar uma ONG?','Você pode ser voluntário, oferecer lar temporário, doar ração e medicamentos ou divulgar os animais para adoção.');