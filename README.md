# Julia & Marcos

Repositório do site de Julia & Marcos: um one page estático, sem back-end nem banco de dados.

Este é um projeto proprietário. O código e os conteúdos não podem ser copiados, redistribuídos ou utilizados sem autorização. Consulte o arquivo `LICENSE`.

## Estado do projeto

Site completo na versão estática, com vídeo e textos provisórios. Os itens a preencher estão marcados com `TODO` no código e entre colchetes na página. O RSVP é só a interface: nenhuma resposta é enviada ou guardada.

## Tecnologias

- HTML5 semântico e acessível;
- SASS (SCSS) com módulos `@use`, mobile-first;
- CSS Grid próprio (`css/grid.css`) e reset (`css/reset.css`);
- JavaScript vanilla com módulos ES6;
- GSAP + ScrollTrigger, Font Awesome e Google Fonts, via CDN.

## Identidade visual

Tudo segue o manual em `assets/Julia-Marcos-MARCA.pdf`.

- Cores: vinho `#4D0622`, bordô `#7D1530`, creme `#FFF5D6`, verde-claro `#C2C267`, oliva `#626B48`.
- Fontes: Bodoni Moda (títulos), Luxurious Script (detalhes grandes), Nunito (texto).
- Logos em `images/`: o sufixo indica o fundo em que cada arquivo deve ser usado (`_fBordo` é a versão clara, para fundo escuro; `_fBege` é a versão bordô, para fundo creme).

## Estrutura

```text
index.html   A página principal do site
traje.html   Explicação do traje, com o mesmo menu e rodapé (copiados, pois não há PHP para reaproveitar)
sass/        Código-fonte dos estilos
css/         grid.css e reset.css (à mão), main.css (compilado pelo Live Sass, não editar à mão)
js/          app.js orquestra os módulos de js/modules/
images/      Logos, favicon, posters do vídeo, ícones, texturas e fotos do casal (image-1 a image-12)
videos/      Vídeos do hero, nas versões vertical e horizontal
assets/      Manual de marca (não vai para a hospedagem)
```

Cada seção da página tem uma parcial em `sass/components/` e, se precisar de comportamento, um módulo em `js/modules/`.

## Desenvolvimento local

Pré-requisitos: extensões Live Sass Compiler e Live Server do VS Code.

1. Abra o projeto no VS Code. O Live Sass compila `sass/main.scss` para `css/main.css` a cada alteração, conforme `.vscode/settings.json`.
2. Abra o `index.html` com o Live Server.

Abrir o arquivo com dois cliques não funciona por completo: o navegador bloqueia módulos ES6 em endereços `file://`, então o JS não roda.

## Publicação

1. Confirme que `css/main.css` está compilado e incluído no commit: o GitHub Pages publica só o que está no repositório e não compila SASS.
2. Troque `DOMINIO` no `<head>` do `index.html` e do `traje.html` pelo domínio real.
3. Envie para a hospedagem apenas `index.html`, `traje.html`, `css/`, `js/`, `images/` e `videos/`.

## Licenças de terceiros

O código deste projeto é proprietário, mas os recursos abaixo seguem as próprias licenças:

| Recurso | Licença |
| --- | --- |
| GSAP + ScrollTrigger | Licença própria da GSAP, sem custo ([termos](https://gsap.com/standard-license/)) |
| Font Awesome Free | Ícones CC BY 4.0, fontes SIL OFL 1.1, código MIT |
| Google Fonts | Varia por família (em geral SIL OFL ou Apache 2.0) |

## Responsável

Henrique Gamborgi Menezes
