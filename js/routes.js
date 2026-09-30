// routes.js
// Cada função abaixo retorna o HTML que vai ser injetado dentro de
// <main id="app"> quando aquela rota é ativada. É basicamente o
// conteúdo que antes vivia dentro da tag <main> de cada arquivo
// .html separado — só que agora como uma string retornada por uma
// função, para o router poder trocar dinamicamente via innerHTML.

// Este arquivo depende de duas funcionalidades isoladas em outros
// módulos: initMascaras (validacao.js) e obterCadastros
// (armazenamento.js). Em vez de assumir que elas "já existem em
// algum lugar global" (como no padrão window.*), a dependência fica
// EXPLÍCITA logo aqui no topo — qualquer pessoa lendo este arquivo
// sabe exatamente de onde vem cada função, sem precisar caçar em
// qual outro <script> ela foi definida.
import { initMascaras } from "./validacao.js";
import { obterCadastros } from "./armazenamento.js";

// ============================================================
// DADOS DE ORIGEM (source data)
// Cada array abaixo é a "fonte da verdade": em vez de escrever um
// <article>, um <li> ou um <details> na mão pra cada item, guardamos
// os dados em objetos simples e geramos o HTML programaticamente.
// Adicionar um projeto novo = adicionar um objeto no array, nunca
// escrever HTML de novo.
// ============================================================

const projetosData = [
  {
    id: "educacao",
    titulo: "Educação para Todos",
    imagem: "../imagens/projeto-educacao.jpg",
    alt: "Crianças participando de aula de reforço escolar em centro comunitário",
    descricao:
      "Reforço escolar gratuito para crianças de 6 a 14 anos em situação de vulnerabilidade.",
    badge: { texto: "Vagas abertas", tipo: "sucesso" },
    detalhes:
      "Aulas de reforço escolar (português e matemática) três vezes por semana, no período da tarde, para crianças de 6 a 14 anos encaminhadas por escolas parceiras da região.",
  },
  {
    id: "alimentacao",
    titulo: "Alimentação Solidária",
    imagem: "../imagens/projeto-alimentacao.jpg",
    alt: "Voluntários preparando cestas básicas para distribuição",
    descricao:
      "Distribuição mensal de cestas básicas para famílias cadastradas na comunidade.",
    badge: { texto: "Mensal", tipo: "info" },
    detalhes: null, // projeto sem modal de detalhes — o template lida com isso condicionalmente
  },
  {
    id: "renda",
    titulo: "Geração de Renda",
    imagem: "../imagens/projeto-renda.jpg",
    alt: "Mulheres participando de oficina de costura profissionalizante",
    descricao:
      "Cursos profissionalizantes gratuitos para geração de renda familiar.",
    badge: { texto: "Poucas vagas", tipo: "alerta" },
    detalhes: null,
  },
];

const frentesVoluntariado = [
  "Reforço escolar",
  "Distribuição de alimentos",
  "Oficinas profissionalizantes",
];

const perguntasFrequentes = [
  {
    pergunta: "Como funciona a doação?",
    resposta:
      "As doações são recebidas via transferência bancária ou presencialmente na sede.",
  },
  {
    pergunta: "Recebo certificado como voluntário?",
    resposta:
      "Sim, emitimos certificado de horas após 20h de atividade voluntária.",
  },
  {
    pergunta: "Quanto tempo dura o voluntariado?",
    resposta:
      "Não há tempo mínimo obrigatório; você define sua disponibilidade no cadastro.",
  },
];

// ============================================================
// FUNÇÕES DE TEMPLATE (template functions)
// Cada função abaixo recebe UM objeto de dados e devolve a STRING
// de HTML correspondente a ele — não sabem nada sobre a lista
// inteira, só sobre como desenhar um item individual.
// ============================================================

/**
 * Gera o <article> de um único projeto. Se o projeto tiver
 * `detalhes` preenchido, inclui também o checkbox + modal; senão,
 * omite esse bloco — interpolação condicional dentro da mesma
 * template literal, usando um operador ternário.
 */
function criarCardProjeto(projeto) {
  const modal = projeto.detalhes
    ? `
        <input type="checkbox" id="modal-${projeto.id}" class="modal-trigger">
        <label for="modal-${projeto.id}" class="modal-abrir">Ver detalhes</label>

        <div class="modal-overlay">
          <div class="modal">
            <label for="modal-${projeto.id}" class="modal-fechar" aria-label="Fechar">&times;</label>
            <h3>${projeto.titulo}</h3>
            <p>${projeto.detalhes}</p>
            <span class="badge badge-${projeto.badge.tipo}">${projeto.badge.texto} para voluntários</span>
          </div>
        </div>`
    : "";

  return `
      <article>
        <h3>${projeto.titulo}</h3>
        <span class="badge badge-${projeto.badge.tipo}">${projeto.badge.texto}</span>
        <img src="${projeto.imagem}" alt="${projeto.alt}">
        <p>${projeto.descricao}</p>
        ${modal}
      </article>`;
}

/**
 * Gera um único <li> da lista de frentes de voluntariado. Recebe
 * uma string simples (não um objeto), já que não há mais nenhum
 * dado além do próprio texto.
 */
function criarItemFrente(frente) {
  return `<li>${frente}</li>`;
}

/**
 * Gera um único bloco <details> do FAQ a partir de um objeto
 * { pergunta, resposta }.
 */
function criarItemFaq(item) {
  return `
      <details>
        <summary>${item.pergunta}</summary>
        <p>${item.resposta}</p>
      </details>`;
}

function renderInicio() {
  // Lê o localStorage NO MOMENTO da renderização — isso garante que,
  // toda vez que a rota "/" é visitada (inclusive vindo de volta de
  // um cadastro recém-enviado em "/cadastro"), o número mostrado
  // reflete o estado mais atual salvo, sem precisar de um evento
  // separado avisando "algo mudou".
  const cadastros = obterCadastros();
  const totalCadastros = cadastros.length;

  let mensagemContador = "";
  if (totalCadastros > 0) {
    const ultimo = cadastros[cadastros.length - 1];
    // dayjs(...).fromNow() converte o timestamp ISO salvo em algo
    // como "há 3 minutos" ou "há 2 dias" — em português, graças ao
    // locale carregado no shell.
    const tempoRelativo = dayjs(ultimo.enviadoEm).fromNow();

    mensagemContador = `
      <p class="contador-cadastros">
        ${totalCadastros} ${totalCadastros === 1 ? "pessoa já se cadastrou" : "pessoas já se cadastraram"} para colaborar.
        Último cadastro: ${tempoRelativo}.
      </p>`;
  }

  return `
    <h1>Bem-vindo à ONG Mãos Solidárias</h1>

    <section id="quem-somos">
      <h2>Quem Somos</h2>
      <img
        src="../imagens/equipe-ong.jpg"
        alt="Voluntários da ONG Mãos Solidárias distribuindo doações em comunidade carente"
      >
      <p>
        A ONG Mãos Solidárias atua desde 2015 apoiando famílias em situação de
        vulnerabilidade social, com foco em educação, alimentação e geração de renda.
      </p>
    </section>

    <section id="missao">
      <h2>Nossa Missão</h2>
      <p>
        Promover dignidade e autonomia por meio de projetos sociais sustentáveis,
        conectando voluntários e comunidades.
      </p>
    </section>

    <section id="chamada-acao">
      <h2>Faça Parte</h2>
      <p>Quer ajudar? Conheça nossos projetos ou cadastre-se como colaborador.</p>
      ${mensagemContador}
      <a href="/projetos" data-link>Ver Projetos</a>
      <a href="/cadastro" data-link>Quero Colaborar</a>
    </section>

    <aside id="contato">
      <h3>Fale Conosco</h3>
      <address>
        <p>Email: <a href="mailto:contato@maossolidarias.org">contato@maossolidarias.org</a></p>
        <p>Telefone: <a href="tel:+551133334444">(11) 3333-4444</a></p>
        <p>Endereço: Rua das Palmeiras, 120 - São Paulo, SP</p>
      </address>
    </aside>
  `;
}

function renderProjetos() {
  return `
    <h1>Nossos Projetos</h1>

    <section id="projetos-andamento">
      <h2>Projetos em Andamento</h2>
      ${projetosData.map(criarCardProjeto).join("")}
    </section>

    <section id="como-doar">
      <h2>Como Doar</h2>
      <p>
        Sua doação sustenta diretamente os projetos acima. Cadastre-se como
        colaborador para saber como contribuir.
      </p>
      <a href="/cadastro" data-link>Quero Doar</a>

      <input type="checkbox" id="toast-demo" class="toast-trigger">
      <label for="toast-demo" class="toast-abrir">Ver exemplo de notificação</label>

      <div class="toast">
        <div>
          <p class="toast-titulo">Cadastro enviado!</p>
          <p class="toast-texto">Obrigado por colaborar com a ONG Mãos Solidárias.</p>
        </div>
        <label for="toast-demo" class="toast-fechar" aria-label="Fechar notificação">&times;</label>
      </div>
    </section>

    <section id="seja-voluntario">
      <h2>Seja Voluntário</h2>
      <ul>
        ${frentesVoluntariado.map(criarItemFrente).join("")}
      </ul>
      <a href="/cadastro" data-link>Quero ser Voluntário</a>
    </section>

    <section id="faq">
      <h2>Perguntas Frequentes</h2>
      ${perguntasFrequentes.map(criarItemFaq).join("")}
    </section>

    <aside id="depoimentos">
      <h3>Depoimentos</h3>
      <blockquote>
        <p>"A ONG mudou a rotina da minha família."</p>
      </blockquote>
    </aside>
  `;
}

function renderCadastro() {
  return `
    <h1>Cadastre-se como Colaborador</h1>
    <p>
      Preencha os dados abaixo para se tornar um colaborador da ONG Mãos
      Solidárias. Todos os campos marcados são obrigatórios.
    </p>

    <div class="alert alert-info">
      <span class="alert-icone">i</span>
      <span>Preencha CPF, telefone e CEP no formato indicado abaixo de cada campo para evitar erros de validação.</span>
    </div>

    <form action="/enviar" method="post" novalidate>
      <fieldset>
        <legend>Dados Pessoais</legend>

        <div class="campo">
          <label for="nome">Nome completo</label>
          <input type="text" id="nome" name="nome" required minlength="3" autocomplete="name">
        </div>

        <div class="campo">
          <label for="email">E-mail</label>
          <input type="email" id="email" name="email" required autocomplete="email">
        </div>

        <div class="campo">
          <label for="nascimento">Data de nascimento</label>
          <input type="date" id="nascimento" name="nascimento" required>
        </div>

        <div class="campo">
          <label for="cpf">CPF</label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            pattern="\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}"
            placeholder="000.000.000-00"
            maxlength="14"
            inputmode="numeric"
            title="Formato esperado: 000.000.000-00"
            required
          >
          <small>Formato: 000.000.000-00</small>
        </div>
      </fieldset>

      <fieldset>
        <legend>Contato</legend>

        <div class="campo">
          <label for="telefone">Telefone</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            pattern="\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}"
            placeholder="(00) 00000-0000"
            maxlength="15"
            inputmode="tel"
            title="Formato esperado: (00) 00000-0000"
            required
          >
          <small>Formato: (00) 00000-0000</small>
        </div>
      </fieldset>

      <fieldset>
        <legend>Endereço</legend>

        <div class="campo">
          <label for="cep">CEP</label>
          <input
            type="text"
            id="cep"
            name="cep"
            pattern="\\d{5}-\\d{3}"
            placeholder="00000-000"
            maxlength="9"
            inputmode="numeric"
            title="Formato esperado: 00000-000"
            required
          >
          <small>Formato: 00000-000</small>
        </div>

        <div class="campo">
          <label for="cidade">Cidade</label>
          <input type="text" id="cidade" name="cidade" required autocomplete="address-level2">
        </div>

        <div class="campo">
          <label for="estado">Estado</label>
          <select id="estado" name="estado" required autocomplete="address-level1">
            <option value="" disabled selected>Selecione</option>
            <option value="SP">São Paulo</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="MG">Minas Gerais</option>
            <option value="PR">Paraná</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="BA">Bahia</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      </fieldset>

      <fieldset>
        <legend>Como deseja colaborar?</legend>

        <div class="campo">
          <input type="checkbox" id="doacao" name="interesse" value="doacao">
          <label for="doacao">Doação</label>
        </div>

        <div class="campo">
          <input type="checkbox" id="voluntariado" name="interesse" value="voluntariado">
          <label for="voluntariado">Voluntariado</label>
        </div>
      </fieldset>

      <button type="submit">Cadastrar</button>
    </form>

    <div class="toast" id="toast-sucesso-cadastro">
      <div>
        <p class="toast-titulo">Cadastro enviado!</p>
        <p class="toast-texto">Obrigado por colaborar com a ONG Mãos Solidárias.</p>
      </div>
    </div>
  `;
}

// Mapa de rotas: cada chave é o caminho da URL, cada valor é um
// objeto com a função de renderização, o título da aba e um hook
// opcional "after" que roda DEPOIS do HTML entrar no DOM (útil pra
// religar listeners em elementos que acabaram de ser criados).
//
// "export const" torna este objeto acessível a quem importar este
// módulo (o router.js) — é a ÚNICA coisa que sai deste arquivo.
// Todas as funções de template (renderInicio, criarCardProjeto,
// mensagemErro etc.) e os arrays de dados (projetosData,
// perguntasFrequentes...) continuam privados ao módulo.
export const routes = {
  "/": {
    render: renderInicio,
    title: "ONG Mãos Solidárias",
  },
  "/projetos": {
    render: renderProjetos,
    title: "Nossos Projetos - ONG Mãos Solidárias",
  },
  "/cadastro": {
    render: renderCadastro,
    title: "Cadastro de Colaborador - ONG Mãos Solidárias",
    after: () => initMascaras(),
  },
};
