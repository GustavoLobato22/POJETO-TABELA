// Baralho de flashcards autoral, com fatos e regras-chave de cada disciplina
// da prova da PMES. O estado de repetição espaçada (SM-2) de cada card é
// mantido separadamente em store.state.flashcardState (ver engine/srs.js).
export const FLASHCARDS = [
  // ---- Língua Portuguesa ----
  { id: 'fc-pt-01', subject: 'portugues', topic: 'regencia-crase', front: 'Crase antes de nomes de cidade', back: 'Só há crase se o nome for determinado por adjunto ("à Vitória que conheci") ou se sempre exigir artigo ("à Bahia"). Sem isso: "vou a Vitória", sem crase.' },
  { id: 'fc-pt-02', subject: 'portugues', topic: 'concordancia', front: '"Fazer" e "haver" indicando tempo', back: 'São impessoais: nunca vão para o plural. "Faz dois anos", "Havia muitas pessoas" — nunca "Fazem" / "Haviam".' },
  { id: 'fc-pt-03', subject: 'portugues', topic: 'regencia-crase', front: '"Assistir" no sentido de ver', back: 'Transitivo indireto: "assisti AO filme", nunca "assisti o filme" na norma culta.' },
  { id: 'fc-pt-04', subject: 'portugues', topic: 'regencia-crase', front: '"Namorar", "obedecer" e "preferir"', back: 'Namorar é transitivo direto ("namoro Marta"); obedecer pede "a" ("obedeço às ordens"); preferir pede "a", não "do que" ("prefiro café a chá").' },
  { id: 'fc-pt-05', subject: 'portugues', topic: 'ortografia', front: 'Paroxítonas terminadas em "-s"', back: 'Não recebem acento ("jovens", "itens", "ordens"), diferente das terminadas em i, l, r, x, um, ã(s), ão(s), que são acentuadas ("táxi", "amável", "órgão").' },
  { id: 'fc-pt-06', subject: 'portugues', topic: 'pontuacao', front: 'Vocativo', back: 'Sempre isolado por vírgula(s): "Soldado, apresente-se."' },
  { id: 'fc-pt-07', subject: 'portugues', topic: 'pontuacao', front: 'Aposto explicativo', back: 'Vem isolado por vírgulas dos dois lados: "O Capitão João, comandante do batalhão, dispensou a tropa."' },
  { id: 'fc-pt-08', subject: 'portugues', topic: 'pontuacao', front: 'Oração explicativa ("que")', back: 'Vem entre vírgulas quando acrescenta informação não essencial: "As viaturas, que estavam com defeito, atrasaram o patrulhamento."' },
  { id: 'fc-pt-09', subject: 'portugues', topic: 'concordancia', front: '"Anexo" como adjetivo', back: 'Concorda em gênero e número com o substantivo: "segue anexo o boletim" / "seguem anexas as fotos".' },
  { id: 'fc-pt-10', subject: 'portugues', topic: 'concordancia', front: '"Proibido" + artigo', back: 'Com artigo definido antes do substantivo, concorda: "é proibida a entrada". Sem artigo, fica invariável: "é proibido entrada".' },
  { id: 'fc-pt-11', subject: 'portugues', topic: 'semantica', front: 'Prosopopeia (personificação)', back: 'Atribuir ação ou característica humana a um ser inanimado: "as ruas emudeceram".' },
  { id: 'fc-pt-12', subject: 'portugues', topic: 'semantica', front: 'Metáfora × Metonímia', back: 'Metáfora = comparação implícita entre elementos diferentes. Metonímia = substituição por contiguidade/relação lógica (ex.: "ler Machado de Assis").' },

  // ---- Raciocínio Lógico e Matemático ----
  { id: 'fc-rlm-01', subject: 'rlm', topic: 'logica-proposicional', front: 'Modus tollens', back: 'Se "p → q" é verdadeira e q é falsa, então p é falsa. ("Se chove, rua molha"; rua seca ⇒ não choveu.)' },
  { id: 'fc-rlm-02', subject: 'rlm', topic: 'logica-proposicional', front: 'Negação de "todo"', back: 'A negação de "todos são X" é "pelo menos um não é X" — nunca "nenhum é X".' },
  { id: 'fc-rlm-03', subject: 'rlm', topic: 'logica-proposicional', front: 'Disjunção inclusiva ("ou")', back: 'Só é falsa quando as duas partes são falsas. Em qualquer outro caso, é verdadeira.' },
  { id: 'fc-rlm-04', subject: 'rlm', topic: 'porcentagem', front: 'Desconto direto em %', back: 'Para aplicar desconto de x%, multiplique pelo complemento: valor × (1 − x/100). Ex.: 15% de desconto = ×0,85.' },
  { id: 'fc-rlm-05', subject: 'rlm', topic: 'porcentagem', front: 'Valor original após aumento', back: 'Se o valor final representa (100+x)% do original, divida pelo fator: original = final ÷ (1 + x/100).' },
  { id: 'fc-rlm-06', subject: 'rlm', topic: 'regra-de-tres', front: 'Regra de três inversa', back: 'Quando aumentar uma grandeza DIMINUI a outra (ex.: mais gente, menos tempo), o produto das duas se mantém constante.' },
  { id: 'fc-rlm-07', subject: 'rlm', topic: 'juros', front: 'Juros simples', back: 'J = C × i × t. O juro não incide sobre juro anterior (cresce de forma linear).' },
  { id: 'fc-rlm-08', subject: 'rlm', topic: 'juros', front: 'Juros compostos', back: 'M = C × (1+i)^t. O juro de cada período incide também sobre os juros acumulados (cresce de forma exponencial).' },
  { id: 'fc-rlm-09', subject: 'rlm', topic: 'geometria', front: 'Trios pitagóricos comuns', back: '(3,4,5), (6,8,10) e (5,12,13) — memorize para resolver triângulos retângulos rapidamente, sem precisar extrair raiz.' },
  { id: 'fc-rlm-10', subject: 'rlm', topic: 'combinatoria', front: 'Combinação × Arranjo', back: 'Use combinação quando a ORDEM não importa (formar uma dupla); use arranjo/permutação quando a ordem importa (definir 1º e 2º colocados).' },
  { id: 'fc-rlm-11', subject: 'rlm', topic: 'sequencias', front: 'Potências de 2 em sequências', back: 'Se a diferença entre termos consecutivos dobra a cada passo, desconfie de uma fórmula do tipo 2ⁿ − 1 ou 2ⁿ.' },
  { id: 'fc-rlm-12', subject: 'rlm', topic: 'geometria', front: 'Área e perímetro do retângulo', back: 'Área = comprimento × largura. Perímetro = 2 × (comprimento + largura).' },

  // ---- Geografia do Brasil e do ES ----
  { id: 'fc-geo-01', subject: 'geografia', topic: 'geografia-fisica-brasil', front: 'Cerrado', back: 'Savana brasileira: árvores baixas e retorcidas, solo ácido, estações seca/chuvosa bem definidas. Predomina no Centro-Oeste.' },
  { id: 'fc-geo-02', subject: 'geografia', topic: 'geografia-fisica-brasil', front: 'Bacia Amazônica', back: 'Maior bacia hidrográfica do mundo em volume de água.' },
  { id: 'fc-geo-03', subject: 'geografia', topic: 'geografia-humana', front: 'Transição demográfica', back: 'Queda das taxas de natalidade e mortalidade, com envelhecimento populacional progressivo.' },
  { id: 'fc-geo-04', subject: 'geografia', topic: 'geografia-humana', front: 'Êxodo rural', back: 'Migração em massa do campo para a cidade — motor histórico do crescimento acelerado das metrópoles brasileiras.' },
  { id: 'fc-geo-05', subject: 'geografia', topic: 'geografia-es', front: 'Relevo do Espírito Santo', back: 'Tabuleiros costeiros no litoral; planaltos e serras no interior, com destaque para a Serra do Caparaó.' },
  { id: 'fc-geo-06', subject: 'geografia', topic: 'geografia-es', front: 'Pico da Bandeira', back: 'Um dos pontos mais altos do Brasil, na divisa do Espírito Santo com Minas Gerais, no Parque Nacional do Caparaó.' },
  { id: 'fc-geo-07', subject: 'geografia', topic: 'geografia-es', front: 'Imigração no Espírito Santo', back: 'Italianos e alemães fixaram-se principalmente na região serrana (ex.: Santa Teresa, Domingos Martins), com agricultura familiar e cafeicultura.' },
  { id: 'fc-geo-08', subject: 'geografia', topic: 'geografia-es', front: 'Economia capixaba', back: 'Forte presença de petróleo, gás, minério de ferro (mineroduto) e celulose, com portos de destaque como o de Vitória.' },
  { id: 'fc-geo-09', subject: 'geografia', topic: 'economia-urbanizacao', front: 'Região mais industrializada do Brasil', back: 'Sudeste — concentra historicamente a maior parte do PIB industrial e de serviços do país.' },
  { id: 'fc-geo-10', subject: 'geografia', topic: 'economia-urbanizacao', front: 'Expansão do agronegócio (soja/pecuária)', back: 'Centro-Oeste, sobretudo Mato Grosso, é o principal polo de expansão recente.' },
  { id: 'fc-geo-11', subject: 'geografia', topic: 'meio-ambiente', front: 'IBAMA × INPE', back: 'INPE monitora por satélite (ex.: PRODES/DETER); IBAMA fiscaliza e aplica multas — tem poder de polícia ambiental.' },
  { id: 'fc-geo-12', subject: 'geografia', topic: 'geopolitica', front: 'Mercosul', back: 'Fundado pelo Tratado de Assunção (1991): Brasil, Argentina, Paraguai e Uruguai.' },

  // ---- História do Brasil e do ES ----
  { id: 'fc-hist-01', subject: 'historia', topic: 'brasil-colonia', front: 'Plantation', back: 'Sistema de grande propriedade monocultora, escravista e voltada à exportação, típico do Brasil Colônia (ex.: engenhos de açúcar).' },
  { id: 'fc-hist-02', subject: 'historia', topic: 'brasil-colonia', front: 'Entradas e bandeiras', back: 'Expedições ao interior do Brasil colonial (principalmente de São Paulo) em busca de indígenas para escravizar e de metais preciosos.' },
  { id: 'fc-hist-03', subject: 'historia', topic: 'brasil-colonia', front: 'Ciclo do Ouro', back: 'Século XVIII, Minas Gerais: povoamento acelerado e forte tributação da Coroa (o quinto, a derrama).' },
  { id: 'fc-hist-04', subject: 'historia', topic: 'brasil-imperio', front: 'Constituição de 1824', back: 'Outorgada por Dom Pedro I, instituiu o Poder Moderador no Primeiro Reinado.' },
  { id: 'fc-hist-05', subject: 'historia', topic: 'brasil-imperio', front: 'Linha do tempo abolicionista', back: 'Eusébio de Queirós (1850, fim do tráfico) → Ventre Livre (1871) → Sexagenários (1885) → Lei Áurea (1888, abolição definitiva).' },
  { id: 'fc-hist-06', subject: 'historia', topic: 'brasil-republica', front: 'República Velha', back: '1889–1930: política do "café com leite" e voto de cabresto.' },
  { id: 'fc-hist-07', subject: 'historia', topic: 'brasil-republica', front: 'Estado Novo', back: '1937–1945: regime ditatorial de Getúlio Vargas.' },
  { id: 'fc-hist-08', subject: 'historia', topic: 'brasil-republica', front: 'Ditadura Militar', back: '1964–1985: regime autoritário instaurado após o golpe de 1964.' },
  { id: 'fc-hist-09', subject: 'historia', topic: 'historia-es', front: 'Capitania do Espírito Santo', back: 'Doada a Vasco Fernandes Coutinho em 1535; deu origem a Vitória, fundada em uma ilha.' },
  { id: 'fc-hist-10', subject: 'historia', topic: 'historia-pm', front: 'Art. 144, §6º da CF/88', back: 'As Polícias Militares são forças auxiliares e reserva do Exército, subordinadas aos governadores, responsáveis pela polícia ostensiva e preservação da ordem pública.' },
  { id: 'fc-hist-11', subject: 'historia', topic: 'historia-pm', front: 'Policiamento ostensivo', back: 'Caracteriza-se pela visibilidade: fardamento e viaturas identificadas, com efeito preventivo pela presença perceptível da autoridade.' },
  { id: 'fc-hist-12', subject: 'historia', topic: 'historia-es', front: 'Imigração serrana no ES', back: 'A partir do fim do século XIX, italianos e alemães se fixaram na Serra capixaba, com agricultura familiar e cafeicultura.' },
];

export function flashcardsBySubject(subjectId) {
  return FLASHCARDS.filter((c) => c.subject === subjectId);
}
