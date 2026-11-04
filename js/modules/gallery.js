// Módulo da galeria: carrossel em loop. Da última foto segue para a primeira e vice-versa,
// pelas setas e arrastando, com o dedo ou com o mouse. O travamento em cada foto vem do CSS.
// Clicar em uma foto abre a versão ampliada em um modal.

export function initGallery() {
    const track = document.querySelector(".galeria-track");
    const previous = document.querySelector('[data-galeria="anterior"]');
    const next = document.querySelector('[data-galeria="proxima"]');
    if (!track || !previous || !next) { console.warn("Galeria não encontrada"); return; }

    // Tempo sem rolagem, em ms, para considerar que o carrossel parou
    const settleDelay = 120;

    // Distância em pixels que separa um clique de um arraste
    const dragThreshold = 5;

    // Parte da largura da foto que basta arrastar para passar à foto seguinte
    const dragNextRatio = 0.15;

    const originals = [...track.children];
    const total = originals.length;

    // Foto atual entre as originais. Serve para manter a posição quando a tela muda de largura
    let currentIndex = 0;

    // Identificador do temporizador que detecta o fim da rolagem
    let settleTimer = null;

    // Largura do carrossel na última medição, para ignorar resize só de altura
    let lastWidth = track.clientWidth;

    // Dados do arraste com o mouse em andamento. Fica null enquanto o botão não está pressionado
    let drag = null;

    // Avisa que o clique disparado ao soltar o botão veio de um arraste e não deve abrir a foto
    let justDragged = false;

    // Indica se há um dedo na tela: o salto do loop precisa esperar ele sair
    let isTouching = false;

    // O loop usa cópias das fotos antes e depois das originais. Assim sempre há uma foto
    // vizinha para mostrar e, ao parar em uma cópia, o carrossel salta para a original
    // equivalente sem o visitante perceber. As cópias ficam ocultas para leitores de tela.
    const makeClones = () => originals.map((slide) => {
        const original = slide.querySelector("img");
        const clone = slide.cloneNode(false);
        const button = original.parentElement.cloneNode(false);

        // A imagem é criada do zero porque um cloneNode nela já dispara o download na hora,
        // ignorando o loading="lazy". Assim, 24 cópias não baixariam as fotos no topo da página.
        const image = document.createElement("img");
        image.loading = "lazy";
        image.decoding = "async";
        image.alt = "";
        image.width = original.width;
        image.height = original.height;
        image.dataset.src = original.getAttribute("src");

        clone.setAttribute("aria-hidden", "true");
        button.tabIndex = -1; // o teclado passa só pelas fotos originais
        button.dataset.descricao = original.alt; // guardada para a versão ampliada
        button.append(image);
        clone.append(button);
        return clone;
    });

    track.prepend(...makeClones());
    track.append(...makeClones());

    // O endereço só entra depois da inserção: com a imagem já na página, o lazy loading vale
    track.querySelectorAll("img[data-src]").forEach((image) => {
        image.src = image.dataset.src;
    });

    // Largura de uma foto mais o espaço entre elas, relida porque muda com a tela
    const getStep = () => originals[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);

    // Posição da foto atual na fileira inteira: cópias anteriores + originais + cópias posteriores
    const getPosition = () => Math.round(track.scrollLeft / getStep());

    // Rola até uma posição da fileira, sem animar para quem pediu menos movimento no sistema
    const scrollToPosition = (position) => {
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        track.scrollTo({ left: position * getStep(), behavior: prefersReduced ? "auto" : "smooth" });
    };

    const scrollByStep = (direction) => {
        scrollToPosition(getPosition() + direction);
    };

    // Ao parar em uma cópia, salta a distância de um conjunto inteiro, voltando às originais.
    // O destino é a posição exata da foto: se o salto interromper o encaixe do CSS, ela não
    // fica desalinhada alguns pixels.
    const handleSettle = () => {
        // Nos dois arrastes, um salto agora puxaria a foto para longe do dedo ou do mouse
        if (drag?.isMoving || isTouching) return;

        const position = getPosition();

        if (position < total) {
            track.scrollTo({ left: (position + total) * getStep(), behavior: "instant" });
        } else if (position >= total * 2) {
            track.scrollTo({ left: (position - total) * getStep(), behavior: "instant" });
        }

        currentIndex = ((position % total) + total) % total;

        // Com a foto já alinhada, religar o travamento não causa nenhum salto
        track.classList.remove("galeria-track-arrastando");
    };

    // Coloca o carrossel na foto atual do conjunto original
    const goToCurrent = () => {
        track.scrollTo({ left: (total + currentIndex) * getStep(), behavior: "instant" });
    };

    previous.addEventListener("click", () => scrollByStep(-1));
    next.addEventListener("click", () => scrollByStep(1));

    track.addEventListener("scroll", () => {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(handleSettle, settleDelay);
    }, { passive: true });

    // No celular, a barra do navegador muda a altura durante a rolagem: só a largura interessa
    window.addEventListener("resize", () => {
        if (track.clientWidth === lastWidth) return;
        lastWidth = track.clientWidth;
        goToCurrent();
    });

    // Arraste com o mouse. No toque, o navegador já faz isso de forma nativa e com inércia,
    // então os outros tipos de ponteiro ficam de fora para não competir com a rolagem dele.
    track.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;

        drag = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startScroll: track.scrollLeft,
            isMoving: false,
        };
    });

    track.addEventListener("pointermove", (event) => {
        if (!drag) return;

        const distance = event.clientX - drag.startX;

        if (!drag.isMoving) {
            if (Math.abs(distance) < dragThreshold) return;

            // A captura só entra aqui: antes disso, um clique simples precisa chegar à foto.
            // Com ela, o arraste continua mesmo se o mouse sair de cima do carrossel.
            drag.isMoving = true;
            track.setPointerCapture(drag.pointerId);
            track.classList.add("galeria-track-arrastando");
        }

        track.scrollLeft = drag.startScroll - distance;
    });

    // Ouve na janela para perceber quando o botão é solto fora do carrossel
    const endDrag = () => {
        if (!drag) return;

        const { isMoving, startScroll } = drag;
        drag = null;

        if (!isMoving) return;

        const dragged = track.scrollLeft - startScroll;
        const startPosition = Math.round(startScroll / getStep());
        let target = getPosition();

        // Um movimento curto, que não chegou à metade da foto, ainda conta como passar de foto
        if (target === startPosition && Math.abs(dragged) > getStep() * dragNextRatio) {
            target += Math.sign(dragged);
        }

        scrollToPosition(target);

        // Garante o fim do arraste mesmo se a foto já estiver no lugar e nada mais rolar
        clearTimeout(settleTimer);
        settleTimer = setTimeout(handleSettle, settleDelay);

        // O clique vem logo depois do pointerup: o timeout zera o aviso caso ele não aconteça
        justDragged = true;
        setTimeout(() => { justDragged = false; }, 0);
    };

    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    // A fase de captura roda antes do ouvinte que abre a foto ampliada
    track.addEventListener("click", (event) => {
        if (justDragged) event.stopImmediatePropagation();
    }, { capture: true });

    // No toque, a rolagem é nativa: basta saber quando o dedo está na tela
    const endTouch = () => {
        isTouching = false;
        clearTimeout(settleTimer);
        settleTimer = setTimeout(handleSettle, settleDelay);
    };

    track.addEventListener("touchstart", () => { isTouching = true; }, { passive: true });
    track.addEventListener("touchend", endTouch, { passive: true });
    track.addEventListener("touchcancel", endTouch, { passive: true });

    // Sem isso, o navegador inicia o arraste nativo da imagem e interrompe o do carrossel
    track.addEventListener("dragstart", (event) => event.preventDefault());

    goToCurrent();
    initPhotoModal(track);
}

// Modal da foto ampliada. O dialog nativo já resolve a tecla Esc e a volta do foco
function initPhotoModal(track) {
    const modal = document.querySelector("#galeria-modal");
    if (!modal) { console.warn("Modal da galeria não encontrado"); return; }

    const photo = modal.querySelector(".galeria-modal-foto");

    // Um único ouvinte no carrossel atende às fotos originais e às cópias do loop
    track.addEventListener("click", (event) => {
        const button = event.target.closest(".galeria-foto");
        if (!button) return;

        const image = button.querySelector("img");

        // Um SVG pode não informar o tamanho natural: nesse caso, valem os atributos do HTML
        const width = image.naturalWidth || Number(image.getAttribute("width"));
        const height = image.naturalHeight || Number(image.getAttribute("height"));

        photo.src = image.src;
        photo.alt = button.dataset.descricao ?? image.alt;
        photo.style.setProperty("--foto-razao", width / height);
        modal.showModal();
    });

    modal.querySelector(".galeria-modal-fechar").addEventListener("click", () => modal.close());

    // A imagem é outro elemento: só o clique na área em volta dela tem o dialog como alvo
    modal.addEventListener("click", (event) => {
        if (event.target === modal) modal.close();
    });
}
