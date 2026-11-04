// Módulo de animações (GSAP): entrada da logo no hero e revelação das seções na rolagem.

export function initAnimations() {
    const root = document.documentElement;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Sem GSAP (CDN fora do ar) ou com movimento reduzido, o conteúdo aparece direto.
    // Remover a classe js libera a logo e a data, que o CSS deixa escondidas.
    if (!window.gsap || prefersReduced) {
        root.classList.remove("js");
        return;
    }

    // A logo animada só existe na home: as outras páginas usam apenas a revelação das seções
    if (document.querySelector(".hero-logo")) {
        animateLogo();
    }

    if (window.ScrollTrigger) {
        animateSections();
    }
}

// Entrada da logo: o J é "escrito" da esquerda para a direita, o M surge e o nome sobe letra a letra.
// A revelação usa recorte em vez de contorno porque o manual proíbe a marca em traçados.
function animateLogo() {
    const { gsap } = window;
    const logo = document.querySelector(".hero-logo");
    const date = document.querySelector(".hero-data");
    if (!logo || !date) { console.warn("Logo do hero não encontrada"); return; }

    const wipe = logo.querySelector(".hero-logo-wipe");

    const timeline = gsap.timeline({ delay: 0.3 });

    timeline
        .set(logo, { visibility: "visible" })
        .fromTo(wipe, { attr: { width: 0 } }, { attr: { width: 258 }, duration: 1.8, ease: "power2.inOut" }, 0)
        .from(logo.querySelector(".hero-logo-base"), { opacity: 0, duration: 1.4, ease: "power1.out" }, 0.3)
        .from(logo.querySelectorAll(".hero-logo-letra"), {
            opacity: 0,
            y: 24,
            duration: 0.8,
            stagger: 0.06,
            ease: "power3.out",
        }, 1.2)
        .fromTo(date, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, 2.2);
}

// Revela cada bloco marcado com data-reveal uma única vez, quando entra na tela
function animateSections() {
    const { gsap, ScrollTrigger } = window;

    gsap.registerPlugin(ScrollTrigger);
    gsap.set("[data-reveal]", { autoAlpha: 0, y: 24 });

    // batch agrupa os blocos que entram juntos, para eles surgirem em sequência
    ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        once: true,
        onEnter: (elements) => {
            gsap.to(elements, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power2.out" });
        },
    });
}
