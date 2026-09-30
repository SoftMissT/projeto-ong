// validacao.js
// Reforça, no lado do cliente, as máscaras de CPF, telefone e CEP
// já validadas estruturalmente pelo atributo `pattern` no HTML.
// Isso melhora a experiência de digitação, mas NÃO substitui
// a validação server-side, que continua sendo obrigatória.
//
// Numa SPA, o formulário de cadastro só existe no DOM DEPOIS que
// o router injeta o fragmento de HTML da rota "/cadastro". Por isso,
// em vez de rodar direto num listener de DOMContentLoaded (que só
// dispara uma vez, no carregamento inicial da página), exportamos a
// função `initMascaras()` como um ES Module para o router.js poder
// importá-la e chamá-la manualmente toda vez que essa rota é
// renderizada.

export function initMascaras() {
  const campoCpf = document.getElementById("cpf");
  const campoTelefone = document.getElementById("telefone");
  const campoCep = document.getElementById("cep");

  if (campoCpf) {
    campoCpf.addEventListener("input", () => {
      campoCpf.value = mascararCpf(campoCpf.value);
    });
  }

  if (campoTelefone) {
    campoTelefone.addEventListener("input", () => {
      campoTelefone.value = mascararTelefone(campoTelefone.value);
    });
  }

  if (campoCep) {
    campoCep.addEventListener("input", () => {
      campoCep.value = mascararCep(campoCep.value);
    });
  }
}

/**
 * Aplica a máscara 000.000.000-00 conforme o usuário digita.
 */
function mascararCpf(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/**
 * Aplica a máscara (00) 00000-0000 conforme o usuário digita.
 */
function mascararTelefone(valor) {
  valor = valor.replace(/\D/g, "").slice(0, 11);

  if (valor.length <= 10) {
    return valor
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }

  return valor
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

/**
 * Aplica a máscara 00000-000 conforme o usuário digita.
 */
function mascararCep(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

// mascararCpf, mascararTelefone e mascararCep NÃO são exportadas —
// continuam privadas a este módulo. Esse é o ganho real dos ES
// Modules sobre o padrão anterior: antes, "privado" era só uma
// convenção de comentário (tudo vivia no mesmo escopo global do
// <script>); agora é uma garantia da própria linguagem nenhum
// outro arquivo consegue acessar essas três funções, mesmo que
// tentasse, porque elas nunca saem do escopo do módulo.

// ============================================================
// SISTEMA DE VALIDAÇÃO COM FEEDBACK INJETADO NO DOM
// ============================================================
//
// Diferente do reportValidity() nativo do navegador (que mostra um
// balão de UI que o desenvolvedor não controla), aqui a validação
// injeta manualmente um <span class="campo-erro"> dentro do wrapper
// .campo correspondente, com uma mensagem escrita por nós e
// alterna as classes "campo--invalido" / "campo--valido" no wrapper,
// que o CSS usa pra colorir a borda do input.

// Mensagens customizadas por campo (chave = id do input/select).
// Quando o campo não tem entrada no dicionário, cai num texto
// genérico baseado no tipo de falha de validação.
const MENSAGENS_ERRO = {
  nome: "Informe seu nome completo (mínimo 3 caracteres).",
  email: "Informe um e-mail válido, no formato nome@dominio.com.",
  nascimento: "Informe uma data de nascimento válida.",
  cpf: "CPF inválido. Use o formato 000.000.000-00.",
  telefone: "Telefone inválido. Use o formato (00) 00000-0000.",
  cep: "CEP inválido. Use o formato 00000-000.",
  cidade: "Informe sua cidade.",
  estado: "Selecione um estado.",
};

/**
 * Decide qual mensagem mostrar para um campo inválido, consultando
 * o objeto `validity` nativo do input (ValidityState) para saber
 * QUAL critério falhou campo vazio, fora do padrão (pattern),
 * tipo errado (e-mail malformado) etc.
 */
function mensagemErro(campo) {
  if (campo.validity.valueMissing) {
    return MENSAGENS_ERRO[campo.id] || "Este campo é obrigatório.";
  }
  if (campo.validity.patternMismatch || campo.validity.typeMismatch) {
    return MENSAGENS_ERRO[campo.id] || "Formato inválido.";
  }
  return MENSAGENS_ERRO[campo.id] || "Valor inválido.";
}

/**
 * Valida UM campo e sincroniza o DOM com o resultado:
 *   - válido   -> remove a mensagem de erro (se existir) e marca
 *                 a classe "campo--valido" (feedback de sucesso)
 *   - inválido -> injeta (ou atualiza) um <span class="campo-erro">
 *                 com o texto certo e marca "campo--invalido"
 *
 * Retorna true/false para quem chamou saber se pode prosseguir.
 */
function validarCampo(campo) {
  const wrapper = campo.closest(".campo");
  if (!wrapper) return true; // campo fora do padrão .campo ignora

  let elementoErro = wrapper.querySelector(".campo-erro");

  if (campo.checkValidity()) {
    wrapper.classList.remove("campo--invalido");
    wrapper.classList.add("campo--valido");
    if (elementoErro) elementoErro.remove(); // limpa mensagem antiga do DOM
    return true;
  }

  wrapper.classList.add("campo--invalido");
  wrapper.classList.remove("campo--valido");

  // Só cria o elemento de mensagem se ele ainda não existir —
  // evita duplicar <span> a cada nova tentativa de digitação.
  if (!elementoErro) {
    elementoErro = document.createElement("span");
    elementoErro.className = "campo-erro";
    elementoErro.setAttribute("role", "alert"); // leitor de tela anuncia a mudança
    wrapper.appendChild(elementoErro);
  }
  elementoErro.textContent = mensagemErro(campo);

  return false;
}

/**
 * Valida TODOS os campos de um formulário de uma vez (chamada no
 * submit). Foca automaticamente o primeiro campo inválido
 * encontrado, para o usuário não precisar caçar o erro na tela.
 */
export function validarFormulario(form) {
  const campos = form.querySelectorAll(".campo input, .campo select");
  let formularioValido = true;
  let primeiroInvalido = null;

  campos.forEach((campo) => {
    const campoOk = validarCampo(campo);
    if (!campoOk) {
      formularioValido = false;
      if (!primeiroInvalido) primeiroInvalido = campo;
    }
  });

  if (primeiroInvalido) primeiroInvalido.focus();
  return formularioValido;
}

// ------------------------------------------------------------
// Listeners delegados no `document` registrados UMA ÚNICA VEZ,
// no carregamento deste script. Diferente de initMascaras() (que
// precisa ser rechamada a cada rota porque prende listeners em
// elementos específicos que são recriados), a delegação aqui
// funciona para qualquer campo .campo que existir no DOM a
// qualquer momento, sem precisar ser "religada".
// ------------------------------------------------------------

// "focusout" (diferente de "blur") BORBULHA pelo DOM, então dá pra
// escutar no document inteiro: valida o campo assim que o usuário
// sai dele, dando o primeiro feedback antes mesmo de tentar enviar.
document.addEventListener("focusout", (evento) => {
  if (evento.target.matches(".campo input, .campo select")) {
    validarCampo(evento.target);
  }
});

// Depois que um campo já foi marcado como inválido uma vez, passamos
// a revalidar em tempo real a cada tecla digitada assim o erro
// some IMEDIATAMENTE quando o usuário corrige o valor, sem precisar
// sair do campo de novo. Antes da primeira validação, não fazemos
// nada aqui (senão o campo ficaria piscando erro desde a primeira
// letra digitada, o que é uma péssima experiência).
document.addEventListener("input", (evento) => {
  if (!evento.target.matches(".campo input")) return;
  const wrapper = evento.target.closest(".campo");
  if (wrapper && wrapper.classList.contains("campo--invalido")) {
    validarCampo(evento.target);
  }
});

// <select> não dispara "input" (só "change"), por isso um listener
// separado para esse caso.
document.addEventListener("change", (evento) => {
  if (evento.target.matches(".campo select")) {
    validarCampo(evento.target);
  }
});

// validarFormulario já foi exportada acima, na própria declaração
// (export function validarFormulario). validarCampo, mensagemErro
// e MENSAGENS_ERRO permanecem privadas ao módulo só quem está
// DENTRO deste arquivo (os listeners de focusout/input/change logo
// acima, e a própria validarFormulario) consegue chamá-las.
