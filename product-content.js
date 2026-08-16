(() => {
  const title = document.querySelector('.product-detail-copy h1')?.textContent.trim();
  const subtitle = document.querySelector('.product-subtitle')?.textContent.trim();
  const description = document.querySelector('.product-description-copy');
  const cards = [...document.querySelectorAll('.product-description-section .benefit-card')];

  if (!title || !subtitle || !description || cards.length < 3) return;

  const normalized = title.toLowerCase();
  const profiles = [
    {
      match: /animal pak|opti-men|mega men sport|multivitamin|maxivit kids|gnc kids/,
      composition: 'Combinação de vitaminas e minerais; algumas apresentações também incluem aminoácidos, colina ou outros componentes. As quantidades exatas devem ser conferidas na tabela nutricional.',
      purpose: 'Complementar a ingestão diária de micronutrientes dentro de uma alimentação equilibrada.',
      audience: /kids/.test(normalized) ? 'Público infantil dentro da faixa etária indicada na embalagem, com acompanhamento do responsável e orientação profissional.' : 'Adultos que desejam complementar a alimentação, respeitando necessidades individuais e a porção indicada.'
    },
    {
      match: /hair skin nails/,
      composition: 'Fórmula de vitaminas e minerais que pode incluir biotina, vitamina C, zinco e outros nutrientes, conforme a apresentação.',
      purpose: 'Complementação nutricional direcionada à rotina de cuidados com cabelo, pele e unhas.',
      audience: 'Adultos que buscam suporte nutricional para a rotina de beleza e bem-estar, após avaliar a composição com um profissional.'
    },
    {
      match: /gold standard whey|iso100|carnivor|good whey protein/,
      composition: /iso100/.test(normalized) ? 'Whey protein isolado e hidrolisado. A fórmula de referência fornece 25 g de proteína por porção; valores variam conforme sabor e mercado.' : /gold standard/.test(normalized) ? 'Blend de whey protein. A fórmula de referência fornece 24 g de proteína por porção; ingredientes e valores variam conforme o sabor.' : /carnivor/.test(normalized) ? 'Proteína isolada e hidrolisada de carne bovina. Consulte a embalagem para proteína por porção, adoçantes e alergênicos.' : 'Suplemento proteico em pó. Confira proteína por porção, aminoácidos, carboidratos, adoçantes e alergênicos no rótulo.',
      purpose: 'Ajudar a complementar a ingestão diária de proteínas em conjunto com alimentação e treinamento adequados.',
      audience: 'Adultos fisicamente ativos ou pessoas com necessidade proteica definida por nutricionista.'
    },
    {
      match: /creatine/,
      composition: 'Creatina em pó, geralmente na forma monohidratada. Confira pureza, ingredientes adicionais e quantidade por porção.',
      purpose: 'Complementar a rotina de exercícios repetidos de alta intensidade e programas de força.',
      audience: 'Adultos fisicamente ativos, conforme planejamento de treino e orientação nutricional.'
    },
    {
      match: /c4 |vapor x5|bcaa 1000/,
      composition: /bcaa/.test(normalized) ? 'Aminoácidos de cadeia ramificada: leucina, isoleucina e valina. A proporção e a quantidade por porção devem ser verificadas no rótulo.' : 'Fórmula pré-treino que pode conter cafeína, beta-alanina e outros ingredientes. Confira a quantidade de estimulantes na embalagem.',
      purpose: /bcaa/.test(normalized) ? 'Complementar a ingestão de aminoácidos dentro de uma estratégia nutricional esportiva.' : 'Dar suporte à rotina de energia e desempenho antes do exercício.',
      audience: 'Adultos fisicamente ativos. Pessoas sensíveis à cafeína, gestantes, lactantes ou usuários de medicamentos devem buscar orientação profissional.'
    },
    {
      match: /omega|fish oil/,
      composition: 'Fonte de ácidos graxos. Nas versões com óleo de peixe, observe especialmente as quantidades de EPA e DHA por porção e a presença de alergênicos.',
      purpose: 'Complementar a ingestão alimentar de ácidos graxos conforme a necessidade nutricional individual.',
      audience: 'Adultos orientados a complementar a dieta; usuários de anticoagulantes devem consultar um profissional antes do consumo.'
    },
    {
      match: /vitamin d|vitamine c|vitafor c|maxivit c/,
      composition: /vitamin d/.test(normalized) ? 'Vitamina D3 (colecalciferol). Verifique cuidadosamente a concentração e a unidade declaradas por cápsula ou porção.' : 'Vitamina C, isolada ou combinada a outros nutrientes conforme a versão. Confira a quantidade por porção na tabela nutricional.',
      purpose: 'Complementar a ingestão do micronutriente quando a alimentação ou a avaliação profissional indicar essa necessidade.',
      audience: 'Adultos ou crianças apenas dentro da faixa etária e da concentração indicadas na embalagem.'
    },
    {
      match: /magnesium/,
      composition: 'Magnésio em forma química e concentração que variam conforme a apresentação. Considere a quantidade de magnésio elementar informada no rótulo.',
      purpose: 'Complementar a ingestão diária de magnésio dentro de uma alimentação equilibrada.',
      audience: 'Adultos com necessidade nutricional avaliada; pessoas com doença renal devem consultar um profissional antes do uso.'
    },
    {
      match: /melatonin|valeriana/,
      composition: /melatonin/.test(normalized) ? 'Melatonina na concentração indicada no rótulo. A dose e as restrições variam conforme a legislação e a apresentação.' : 'Extrato de valeriana, isolado ou combinado com outros ingredientes conforme a fórmula.',
      purpose: 'Complementar uma rotina de relaxamento e sono, sem substituir hábitos saudáveis nem avaliação clínica.',
      audience: 'Adultos, respeitando as advertências. Não associar a álcool, sedativos ou atividades que exijam atenção sem orientação profissional.'
    },
    {
      match: /quest protein/,
      composition: 'Alimento proteico pronto para consumo, com proteína e fibras. Açúcares, gorduras, calorias e alergênicos variam de acordo com o sabor.',
      purpose: 'Oferecer uma opção prática de lanche proteico dentro do planejamento alimentar.',
      audience: 'Adultos que desejam uma alternativa prática, observando necessidades energéticas e possíveis alergênicos.'
    },
    {
      match: /medicube|celimax/,
      composition: 'Produto cosmético para uso tópico. Ingredientes ativos e modo de aplicação variam conforme a fórmula; consulte a lista INCI e as instruções da embalagem.',
      purpose: 'Complementar a rotina de cuidados da pele de acordo com a finalidade indicada para o produto.',
      audience: 'Adultos. Faça teste em pequena área, introduza ativos gradualmente e interrompa o uso em caso de irritação.'
    },
    {
      match: /age-r booster/,
      composition: 'Dispositivo cosmético de uso doméstico, acompanhado dos acessórios indicados para a respectiva versão.',
      purpose: 'Complementar a aplicação de cosméticos compatíveis conforme os modos e intensidades descritos no manual.',
      audience: 'Adultos que não apresentem as contraindicações listadas pelo fabricante e sigam integralmente o manual de uso.'
    },
    {
      match: /lipo 6|citrumax|slimex/,
      composition: 'A composição pode incluir estimulantes ou outros ativos voltados ao controle de peso. Confirme ingredientes, concentração, registro e contraindicações antes da compra.',
      purpose: 'Produto apresentado para complementar programas de controle de peso, que devem priorizar alimentação, atividade física e acompanhamento profissional.',
      audience: 'Somente adultos com avaliação profissional. Não indicado para gestantes, lactantes, menores ou pessoas sensíveis a estimulantes.'
    },
    {
      match: /dysport|hutox|israderm|tirzep|tirzec|retatr|reta |retagen|bpc|tb-500|ghk|ipamorelin|kpv|ss-31|pt-141|nad\+|mostc|klow|glow|tg 10|tg 15/,
      composition: 'Produto de uso especializado, sujeito a confirmação rigorosa de princípio ativo, concentração, fabricante, lote, conservação e regularidade sanitária.',
      purpose: 'Não é destinado à automedicação nem ao uso autônomo. A finalidade depende de avaliação clínica e das indicações legalmente autorizadas.',
      audience: 'Exclusivamente pacientes ou profissionais habilitados, quando houver prescrição, produto regularizado e supervisão adequada.'
    }
  ];

  const profile = profiles.find(item => item.match.test(normalized)) || {
    composition: 'A composição, a quantidade por porção e os ingredientes adicionais devem ser confirmados na embalagem da apresentação disponível.',
    purpose: 'Complementar a rotina de saúde, nutrição ou bem-estar de acordo com a indicação específica do produto.',
    audience: 'Pessoas que atendam ao público indicado no rótulo e que tenham avaliado restrições, alergênicos e possíveis interações.'
  };

  const regulated = /experimental|prescri|uso profissional|regularidade sanitária|não é destinado à automedicação/i.test(`${subtitle} ${profile.purpose}`);
  description.innerHTML = `
    <p>${subtitle}</p>
    <p><strong>Composição e informações relevantes:</strong> ${profile.composition}</p>
    <p><strong>Para que serve:</strong> ${profile.purpose}</p>
    <p><strong>Para quem é indicado:</strong> ${profile.audience}</p>
    <p><strong>Importante:</strong> ${regulated ? 'A comercialização e o uso dependem de procedência regular, prescrição ou habilitação profissional, conforme a categoria do produto.' : 'Suplementos e cosméticos não substituem alimentação equilibrada, diagnóstico ou acompanhamento profissional. Confira sempre o rótulo da apresentação recebida.'}</p>`;

  const content = [
    ['Composição', profile.composition],
    ['Finalidade', profile.purpose],
    ['Para quem', profile.audience]
  ];

  cards.slice(0, 3).forEach((card, index) => {
    const heading = card.querySelector('h3');
    const paragraph = card.querySelector('p');
    if (heading) heading.textContent = content[index][0];
    if (paragraph) paragraph.textContent = content[index][1];
  });
})();
