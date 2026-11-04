// Módulo do header: fundo sólido depois da rolagem e menu sanduíche no celular.

export function initHeader() {
    const header = document.querySelector(".header-con");
    const burger = document.querySelector(".header-burger");
    const links = document.querySelector(".header-links");
    if (!header || !burger || !links) { console.warn("Header não encontrado"); return; }

    const burgerIcon = burger.querySelector("i");

    // Distância em pixels a partir da qual o header deixa de ser transparente
    const scrollLimit = 10;

    const updateScroll = () => {
        header.classList.toggle("header-scrolled", window.scrollY > scrollLimit);
    };

    // Abre ou fecha o menu, mantendo ícone e atributos de acessibilidade em sincronia
    const setMenu = (isOpen) => {
        links.classList.toggle("header-links-aberto", isOpen);
        header.classList.toggle("header-aberto", isOpen);
        burger.setAttribute("aria-expanded", String(isOpen));
        burger.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
        burgerIcon.classList.toggle("fa-bars", !isOpen);
        burgerIcon.classList.toggle("fa-xmark", isOpen);
    };

    burger.addEventListener("click", () => {
        setMenu(burger.getAttribute("aria-expanded") !== "true");
    });

    // No one page, o link leva a outra seção da mesma tela: o menu precisa fechar sozinho
    links.addEventListener("click", (event) => {
        if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setMenu(false);
    });

    const enableSmoothScroll = () => {
        document.documentElement.classList.add("rolagem-suave");
    };

    // Quem chega por uma âncora espera o carregamento: o ScrollTrigger interromperia a animação
    // e a página ficaria no topo. Nos outros casos, liga na hora: o load espera o primeiro
    // quadro do vídeo do hero e, em internet lenta, o menu ficaria sem a rolagem suave.
    if (window.location.hash) {
        window.addEventListener("load", enableSmoothScroll);
    } else {
        enableSmoothScroll();
    }

    // Roda uma vez na carga: o navegador pode restaurar a página já rolada
    updateScroll();

    // passive avisa que o evento não bloqueia a rolagem, o que a mantém fluida
    window.addEventListener("scroll", updateScroll, { passive: true });
}
