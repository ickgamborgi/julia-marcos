// Módulo do FAQ: abre uma resposta por vez. A animação de altura fica no CSS (_faq.scss).

export function initFaq() {
    const items = document.querySelectorAll(".faq-item");
    if (!items.length) { console.warn("FAQ não encontrado"); return; }

    // Mantém a classe visual e o atributo de acessibilidade sempre em sincronia
    const setOpen = (item, isOpen) => {
        item.classList.toggle("faq-item-aberto", isOpen);
        item.querySelector(".faq-pergunta").setAttribute("aria-expanded", String(isOpen));
    };

    items.forEach((item) => {
        item.querySelector(".faq-pergunta").addEventListener("click", () => {
            const willOpen = !item.classList.contains("faq-item-aberto");

            items.forEach((other) => setOpen(other, false));
            setOpen(item, willOpen);
        });
    });
}
