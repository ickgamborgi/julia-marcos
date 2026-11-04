// Módulo de rastreamento: centraliza os eventos enviados ao dataLayer.
// Elementos com data-track disparam o evento de clique com aquele nome.

// O dataLayer pode não existir enquanto o Google Tag Manager não estiver instalado
export function trackEvent(name, params = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...params });
}

export function initTracking() {
    // Um único ouvinte no document cobre todos os elementos, inclusive os adicionados depois
    document.addEventListener("click", (event) => {
        const element = event.target.closest("[data-track]");
        if (element) trackEvent(element.dataset.track);
    });
}
