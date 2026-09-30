// armazenamento.js
// Camada de persistência local. Como o projeto não tem back-end de
// verdade (o action="/enviar" do formulário é só um placeholder),
// usamos o localStorage do navegador para simular a "sobrevivência"
// dos cadastros entre uma visita e outra — os dados continuam lá
// mesmo se a aba for fechada e reaberta, ou se a página recarregar.
//
// IMPORTANTE: localStorage só guarda STRINGS. Não é possível salvar
// um array ou objeto JavaScript diretamente — por isso toda escrita
// passa por JSON.stringify() (serializa o objeto para texto) e toda
// leitura passa por JSON.parse() (reconstrói o objeto a partir do
// texto salvo).

const CHAVE_CADASTROS = "ong-maos-solidarias:cadastros";

/**
 * Lê a lista de cadastros salva no localStorage e a devolve como um
 * array JavaScript de verdade (não como string).
 *
 * getItem() retorna `null` se a chave nunca foi gravada antes — por
 * isso o operador ternário: sem essa checagem, JSON.parse(null)
 * devolveria `null` em vez de um array vazio, e qualquer código que
 * tentasse fazer .push() ou .map() nisso quebraria.
 *
 * O try/catch protege contra o cenário em que alguém (ou alguma
 * extensão do navegador) corrompeu manualmente o valor salvo,
 * deixando um JSON inválido — sem isso, um JSON.parse() malformado
 * derrubaria a aplicação inteira com uma exceção não tratada.
 */
export function obterCadastros() {
  try {
    const bruto = localStorage.getItem(CHAVE_CADASTROS);
    return bruto ? JSON.parse(bruto) : [];
  } catch (erro) {
    console.error("Não foi possível ler os cadastros salvos:", erro);
    return [];
  }
}

/**
 * Adiciona um novo cadastro à lista existente e regrava tudo no
 * localStorage. Repare que não existe um "update parcial" — sempre
 * lemos a lista inteira, alteramos em memória (JavaScript puro) e
 * regravamos a lista inteira de volta. É assim que localStorage
 * funciona: não há um "banco de dados" por trás, só uma string.
 */
export function salvarCadastro(dadosCadastro) {
  try {
    const listaAtual = obterCadastros();

    listaAtual.push({
      ...dadosCadastro,
      enviadoEm: new Date().toISOString(), // registro de quando o cadastro entrou
    });

    localStorage.setItem(CHAVE_CADASTROS, JSON.stringify(listaAtual));
    return true;
  } catch (erro) {
    // Pode falhar se o localStorage estiver cheio (limite ~5-10MB
    // por origem) ou se o navegador estiver em modo privado restrito.
    console.error("Não foi possível salvar o cadastro:", erro);
    return false;
  }
}

/**
 * Extrai do <form> apenas os campos que fazem sentido persistir —
 * evitamos salvar tudo indiscriminadamente. `FormData` lê os pares
 * nome/valor de todos os campos preenchidos automaticamente, sem
 * precisarmos escrever `form.nome.value`, `form.email.value` etc.
 * um por um.
 */
export function extrairDadosFormulario(form) {
  const formData = new FormData(form);

  // "interesse" é um checkbox que pode ter MÚLTIPLOS valores
  // marcados ao mesmo tempo (Doação + Voluntariado). getAll() (em
  // vez de get()) devolve todos os valores marcados, não só o
  // primeiro.
  return {
    nome: formData.get("nome"),
    email: formData.get("email"),
    cidade: formData.get("cidade"),
    estado: formData.get("estado"),
    interesse: formData.getAll("interesse"),
  };
}

// obterCadastros, salvarCadastro e extrairDadosFormulario já foram
// exportadas acima, na própria declaração de cada função. CHAVE_CADASTROS
// permanece privada ao módulo — nenhum outro arquivo do projeto
// consegue ler ou sobrescrever essa constante diretamente, evitando
// que alguém, em outro arquivo, grave por engano numa chave errada
// do localStorage (ex.: um typo tipo 'cadastro' em vez de 'cadastros').
