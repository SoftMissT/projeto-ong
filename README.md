# 🤝 ONG Mãos Solidárias — Plataforma Web

[![Licença MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![SemVer](https://img.shields.io/badge/SemVer-1.0.0-success.svg)](https://semver.org)
[![GitFlow](https://img.shields.io/badge/Workflow-GitFlow-orange.svg)](https://nvie.com/posts/a-successful-git-branching-model/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Plataforma web institucional desenvolvida para a **ONG Mãos Solidárias**, entidade sem fins lucrativos focada no apoio a famílias em vulnerabilidade social por meio de educação, nutrição e geração de renda. O projeto conta com arquitetura SPA (*Single Page Application*) em Vanilla JavaScript, design system responsivo e formulário interativo de voluntariado com validação e persistência local.

---

## 📌 Sumário
1. [Sobre o Projeto](#-sobre-o-projeto)
2. [Funcionalidades Principais](#-funcionalidades-principais)
3. [Tecnologias e Bibliotecas](#-tecnologias-e-bibliotecas)
4. [Arquitetura e Estrutura de Pastas](#-arquitetura-e-estrutura-de-pastas)
5. [Instalação e Execução Local](#-instalação-e-execução-local)
6. [Estratégia de Versionamento e GitFlow](#-estratégia-de-versionamento-e-gitflow)
7. [Histórico de Releases](#-histórico-de-releases)
8. [Licença](#-licença)

---

## 🌟 Sobre o Projeto
A plataforma da **ONG Mãos Solidárias** foi projetada para garantir presença digital acessível, intuitiva e de alta performance. Seu propósito é aproximar voluntários, doadores e a comunidade por meio da divulgação transparente de projetos socioeducativos e da facilitação do cadastro de voluntários.

---

## 🚀 Funcionalidades Principais
- **Navegação SPA (*Single Page Application*)**: Transições dinâmicas de telas sem recarregamento da página, utilizando hash routing (`#/`, `#/projetos`, `#/cadastro`).
- **Vitrine de Projetos Sociais**: Listagem dinâmica orientada a dados com cartões informativos, badges de status de vagas e detalhes expansíveis.
- **Formulário de Cadastro com Validação**: Validações robustas em tempo real para CPF, CEP com auto-preenchimento, telefone e email, com mensagens de erro acessíveis e inline.
- **Persistência de Dados**: Armazenamento local de voluntários cadastrados utilizando a API nativa de `localStorage`.
- **Design System Responsivo**: Layout construído com Grid de 12 colunas, variáveis customizadas CSS, suporte completo a mobile e desktop, além de menu off-canvas responsivo.

---

## 🛠️ Tecnologias e Bibliotecas

| Tecnologia | Finalidade |
| :--- | :--- |
| **HTML5 Semântico** | Estruturação acessível com uso de `<header>`, `<main>`, `<section>`, `<article>`, `<dialog>` e tags de acessibilidade (WAI-ARIA). |
| **CSS3 Moderno** | Design System com variáveis (`--primary`, `--accent`, etc.), layout em Grid de 12 colunas, Flexbox e Mobile-First. |
| **JavaScript (ES6 Modules)** | Lógica funcional client-side, manipulação do DOM e modularização nativa com `import`/`export`. |
| **Day.js (v1 via CDN)** | Biblioteca para manipulação, formatação de datas e cálculo de tempo relativo (`.fromNow()`) em português (`pt-br`). |
| **LocalStorage API** | Persistência local no navegador das informações de cadastro dos voluntários. |

---

## 📁 Arquitetura e Estrutura de Pastas

```text
projeto-ong/
├── css/
│   └── style.css            # Design System, variáveis CSS, grid e media queries
├── imagens/
│   ├── equipe-ong.jpg       # Imagem da equipe institucional
│   ├── logo-ong.png         # Logotipo oficial
│   ├── projeto-alimentacao.jpg
│   ├── projeto-educacao.jpg
│   └── projeto-renda.jpg
├── js/
│   ├── armazenamento.js     # Gerenciamento de persistência com localStorage
│   ├── router.js            # Roteador SPA baseado em eventos hashchange
│   ├── routes.js            # Definição de rotas, templates HTML e dados de projetos
│   └── validacao.js         # Máscaras de entrada (CPF, CEP, telefone) e validações
├── cadastro.html            # Ponto de acesso direto / fallback
├── index.html               # Shell principal da aplicação SPA
├── projetos.html            # Ponto de acesso direto / fallback
├── LICENSE                  # Licença MIT do projeto
└── README.md                # Documentação técnica completa
```

---

## 💻 Instalação e Execução Local

Como a aplicação é construída com tecnologias web puras e módulos nativos ES6 (`import`/`export`), **não há necessidade de compilação ou gerenciadores de pacotes pesados (como NPM/Node.js)**. Contudo, devido às políticas de segurança de módulos ES6 (*CORS* em protocolo `file://`), ela deve ser servida via um servidor HTTP local.

### Pré-requisitos
- Navegador moderno (Google Chrome, Firefox, Safari ou Edge).
- Um servidor estático simples (extensão **Live Server** do VS Code, Python ou Node).

### Passo a Passo

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/SoftMissT/projeto-ong.git
   cd projeto-ong
   ```

2. **Executar um Servidor Local**:
   - **Opção A (VS Code)**: Abra a pasta no VS Code, clique com o botão direito em `index.html` e selecione **"Open with Live Server"**.
   - **Opção B (Python)**:
     ```bash
     # Python 3
     python -m http.server 3000
     ```
   - **Opção C (Node.js / npx)**:
     ```bash
     npx serve .
     ```

3. **Acessar a Aplicação**:
   Abra no seu navegador o endereço indicado (geralmente `http://localhost:5500` ou `http://localhost:3000`).

---

## 🌿 Estratégia de Versionamento e GitFlow

O ciclo de vida do desenvolvimento adotou o padrão **GitFlow** aliado ao **Versionamento Semântico (SemVer)** e **Conventional Commits**:

### Branches
- `main`: Branch de código estável em produção, contendo apenas versões taggeadas.
- `develop`: Branch de integração contínua contendo as implementações mais recentes testadas.
- `feature/*`: Branches temporárias criadas a partir de `develop` para desenvolvimento isolado de funcionalidades (ex: `feature/design-system-css`).
- `hotfix/*`: Branches criadas a partir de `main` para resolução emergencial de defeitos, integradas de volta em `main` e `develop`.

### Versionamento Semântico (MAJOR.MINOR.PATCH)
- **MAJOR (`1.0.0`)**: Primeira release de produção totalmente estável.
- **MINOR (`0.x.0`)**: Novas funcionalidades ou marcos arquiteturais (HTML semântico, CSS/Design System, SPA/Router).
- **PATCH (`0.3.1`)**: Correções de defeitos sem impacto de compatibilidade retroativa.

---

## 🏷️ Histórico de Releases e Tags

| Tag | Tipo | Descrição |
| :--- | :--- | :--- |
| `v0.1.0` | Minor | `feat(html): estrutura semântica e formulário com validação` |
| `v0.2.0` | Minor | `feat(css): design system, grid 12 colunas, menu e componentes de feedback` |
| `v0.3.0` | Minor | `feat(spa): roteamento, templates dinâmicos, localStorage e módulos ES6` |
| `v0.3.1` | Patch | `fix(router): base path, fechamento do menu mobile e seletor CSS` |
| `v1.0.0` | Major | `release: entrega final` |

---

## 📄 Licença
Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações.
