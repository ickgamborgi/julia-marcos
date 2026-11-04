# Padrão global do Henrique

Instruções que valem para todo projeto. Se o projeto tiver um `CLAUDE.md` próprio, ele complementa ou sobrepõe este.

## Sobre mim e como trabalhar comigo

- Sou desenvolvedor front-end (HTML, SASS, JS) e designer. Sou mais fraco em back-end, PHP e banco de dados: nessas partes, explique mais a fundo o porquê das decisões. No front-end, pode pular o básico.
- Respostas diretas e específicas, em português do Brasil. Sem tom de venda e sem explicações genéricas.
- Não use travessão (—) em textos, comentários ou mensagens. Use vírgula, dois pontos ou parênteses.
- Antes de mudanças estruturais (nova pasta, nova tabela, alterar schema do banco, trocar biblioteca), proponha e espere minha confirmação.
- Antes de criar algo novo, leia o que já existe no projeto e siga o padrão encontrado.

## Stack prioritária

Use nesta ordem de preferência, a não ser que eu peça outra coisa:

1. **HTML5 semântico**
2. **SASS (SCSS)** compilado para CSS
3. **JavaScript vanilla** com módulos ES6 (sem framework)
4. **PHP** com **PDO** e **MySQL/MariaDB**
5. Bibliotecas que já domino: **GSAP + ScrollTrigger** (animação), **Plyr.io** (vídeo), **Font Awesome** via cdnjs (ícones), **Google Fonts** (tipografia)

Não introduza frameworks (React, Vue, Tailwind, Laravel etc.) nem dependências novas sem perguntar antes.

## Regra de ouro: comentar tudo

- Comentário de bloco antes de cada seção lógica, explicando o **porquê**, não só o quê.
- Comentário de linha em todo ponto que não é óbvio à primeira leitura.
- Comentários sempre em **português**.
- No HTML, comentários como divisores de seção: `<!-- Header -->`, `<!-- Navegação principal -->`.
- Cada parcial SASS e cada módulo JS começa com um comentário dizendo o que ele é.

## Estrutura de pastas padrão (site PHP)

```
/
├── index.php
├── config/            → db.php (conexão PDO), config.php (constantes)
├── core/              → funções utilitárias reutilizáveis (functions.php)
├── admin/             → CMS protegido por login (uma pasta por entidade)
├── api/               → endpoints PHP que retornam JSON (um arquivo por entidade)
├── pages/             → páginas do site
├── templates/
│   └── components/    → partes reutilizáveis (header.php, footer.php, cards...)
├── sass/
│   ├── abstracts/     → _variables, _mixins, _fonts (não geram CSS sozinhos)
│   ├── base/          → reset e estilos gerais
│   ├── components/    → um arquivo por componente (_hero.scss, _footer.scss)
│   ├── pages/         → ajustes específicos de página
│   └── main.scss      → só faz @use dos outros
├── css/               → main.css compilado (não editar à mão)
├── js/
│   ├── app.js         → só orquestra os módulos
│   └── modules/       → um arquivo por funcionalidade
├── images/
└── uploads/           → arquivos enviados pelo admin
```

Use o mesmo nome de entidade em todas as camadas (ex: `accommodations.php` no `/admin` **e** no `/api`), nunca variações.

## HTML

- Hierarquia de headings ocultos (`class="hidden"`) em cada seção, mesmo que não apareçam visualmente, mantendo a ordem h1 → h2 → h3. Ex:
  ```html
  <h1 class="hidden">Nome do Site</h1>
  <h2 class="hidden">Header</h2>
  <header>
      <nav>
          <h3 class="hidden">Navegação principal</h3>
  ```
- `<head>` completo: description, Open Graph, Twitter Card, favicon.
- Google Fonts com `preconnect`.
- `<script defer>` para bibliotecas externas, `<script type="module">` para o JS próprio.
- Acessibilidade: `alt` descritivo, `aria-label` em botões só com ícone, foco visível, contraste adequado.
- Em templates que vão receber dados do banco, marque os campos: `data-field="nome"` ou `<!-- CMS: nome -->`.

## SASS

- Módulos com `@use`, nunca `@import`: `@use "../abstracts/variables" as a;` e depois `a.$cor-primaria`.
- Variáveis centralizadas em `_variables.scss`, agrupadas com comentário (`// Cores`, `// Fontes`, `// Outros`).
- Classes com prefixo do componente + elemento: `.hero-image-con`, `.hero-bio`, `.card-galeria`.
- **Mobile-first**. Marque o início com `/* --Primeiro: Mobile--- */` e coloque as media queries depois, no mesmo arquivo.
- Indentação de 4 espaços.

## JavaScript

- `app.js` só importa e inicializa:
  ```js
  import { initHeader } from "./modules/header.js";
  import { initSlider } from "./modules/slider.js";

  document.addEventListener("DOMContentLoaded", () => {
      initHeader();
      initSlider();
  });
  ```
- Cada módulo exporta uma função `initAlgumaCoisa()`.
- Checagem defensiva no início antes de mexer no DOM:
  ```js
  const slider = document.querySelector(".slider");
  if (!slider) { console.warn("Slider não encontrado"); return; }
  ```
- Comente o propósito de cada variável de estado.
- `const` por padrão, `let` só quando reatribui. Nada de `var`.

## PHP

- Indentação de 4 espaços.
- `<?php ... ?>` para lógica, `<?= $variavel ?>` dentro do HTML.
- Variáveis em `camelCase` (`$coverFileType`), colunas do banco em `snake_case`.
- **Banco sempre com PDO e prepared statements, parâmetros nomeados.** Nunca concatenar variável na query:
  ```php
  $stmt = $pdo->prepare('SELECT * FROM users WHERE id = :userId'); // busca o usuário logado
  $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
  $stmt->execute();
  ```
- Conexão em arquivo único (`config/db.php`) com `try/catch` e `error_log()` em caso de falha. Nunca exibir erro do banco na tela.
- Depois de toda operação de escrita: `header('Location: pagina.php'); exit();`
- Escapar saída no HTML com `htmlspecialchars()`.
- Credenciais fora do código versionado (`.env` ou `config` no `.gitignore`).

## Admin e autenticação

- `session_start()` no topo de toda página protegida.
- Logo no início, antes de qualquer saída:
  ```php
  if (!isset($_SESSION['user_id'])) { header('Location: login.php'); exit(); }
  ```
- Senhas com `password_hash()` e `password_verify()`.
- Campo **honeypot** no formulário de login (antispam).
- `logout.php` dedicado, só destruindo a sessão.

## Upload de arquivos

- Gerar nome único (`generateUniqueFileName()`).
- Validar extensão **e** MIME real com `finfo`. Bloquear `.php`, `.exe` e afins mesmo disfarçados.
- Limitar tamanho e salvar em `/uploads`.

## Performance e SEO

- Imagens em WebP/AVIF com `loading="lazy"` (exceto a primeira dobra).
- Vídeo de hero com `poster` estático e versão comprimida.
- Formulários que coletam dados pessoais têm checkbox de consentimento (LGPD).
- Eventos de rastreamento (cliques em WhatsApp, envio de formulário, reservas) via `dataLayer.push()`, com nomes consistentes.

## Git

- Mensagens de commit em português, curtas e no imperativo: `Adiciona módulo de slider`, `Corrige validação do upload`.
- Nunca commitar credenciais, `node_modules` ou `css/` compilado se o projeto não pedir.
