// Módulo da contagem regressiva: mostra dias, horas e minutos e troca a mensagem quando a data chega.

// Milissegundos em cada unidade de tempo
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Rótulos no singular e no plural
const labels = {
    dias: ["Dia", "Dias"],
    horas: ["Hora", "Horas"],
    minutos: ["Minuto", "Minutos"],
};

export function initCounter() {
    const section = document.querySelector("[data-contagem-alvo]");
    if (!section) { console.warn("Contagem regressiva não encontrada"); return; }

    const numbers = section.querySelector(".contagem-numeros");
    const message = section.querySelector(".contagem-chegou");
    const title = section.querySelector(".secao-script");

    // A data leva o fuso (-03:00) no HTML: assim todo convidado conta até o mesmo instante
    const target = new Date(section.dataset.contagemAlvo).getTime();

    // Guarda o identificador do intervalo para poder pará-lo quando a data chegar
    let intervalId = null;

    const render = () => {
        const remaining = target - Date.now();

        if (remaining <= 0) {
            numbers.hidden = true;
            title.hidden = true;
            message.hidden = false;
            clearInterval(intervalId);
            return;
        }

        const values = {
            dias: Math.floor(remaining / DAY),
            horas: Math.floor((remaining % DAY) / HOUR),
            minutos: Math.floor((remaining % HOUR) / MINUTE),
        };

        Object.entries(values).forEach(([unit, value]) => {
            section.querySelector(`[data-contagem="${unit}"]`).textContent = String(value).padStart(2, "0");
            section.querySelector(`[data-rotulo="${unit}"]`).textContent = labels[unit][value === 1 ? 0 : 1];
        });
    };

    // Confere a cada segundo, mesmo sem exibir segundos, para o minuto virar na hora certa
    intervalId = setInterval(render, SECOND);
    render();
}
