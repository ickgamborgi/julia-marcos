// Módulo do hero: poster certo para cada tela e respeito à preferência por menos movimento.

export function initHero() {
    const video = document.querySelector(".hero-video");
    if (!video) { console.warn("Vídeo do hero não encontrado"); return; }

    // O HTML traz o poster vertical (mobile-first). O atributo só aceita um arquivo,
    // então a versão horizontal é trocada aqui, junto com o breakpoint do vídeo.
    if (window.matchMedia("(min-width: 768px)").matches) {
        video.poster = "images/hero-poster-desktop.jpg";
    }

    // Quem pediu menos movimento no sistema vê só o poster
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        video.pause();
    }
}
