// Módulo do RSVP: busca de convidados, lista com a resposta de cada um e envio.
// Por enquanto é só JavaScript: nenhuma resposta é enviada ou guardada.

import { trackEvent } from "./tracking.js";

// TODO: nomes de exemplo. A lista real não deve ficar aqui, porque tudo o que está
// no JS é público: ela precisa vir de um back-end, que também receberá as respostas.
const guests = [
    "Julia Ghislandi Fretta",
    "Marcos Nunes",
];

// Quantidade mínima de letras para pesquisar
const minSearchLength = 2;

// Tempo mínimo, em ms, entre abrir o modal e enviar: pessoas não preenchem tudo em menos que isso
const minFillTime = 3000;

// Celular brasileiro: DDD + 9 + 8 dígitos
const mobilePattern = /^[1-9][1-9]9\d{8}$/;

// Compara sem diferenciar maiúsculas nem acentos: "julia" encontra "Júlia"
const normalize = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Mantém só os números do celular
const getDigits = (text) => text.replace(/\D/g, "");

// Formata enquanto a pessoa digita: (49) 99999-9999
const formatMobile = (digits) => {
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

// TODO: enviar os dados para o back-end quando houver tabela de convidados.
// O rastreamento leva só contagens: dados pessoais nunca vão para o dataLayer.
const sendRsvp = (payload) => {
    trackEvent("rsvp_enviado", {
        convidados: payload.respostas.length,
        confirmados: payload.respostas.filter((response) => response.presenca === "sim").length,
    });
};

export function initRsvp() {
    const modal = document.querySelector("#rsvp-modal");
    const form = document.querySelector("#rsvp-form");
    const template = document.querySelector("#rsvp-convidado-template");
    if (!modal || !form || !template) { console.warn("Modal de RSVP não encontrado"); return; }

    const searchInput = form.querySelector("#rsvp-busca-input");
    const status = form.querySelector("[data-rsvp-status]");
    const results = form.querySelector("[data-rsvp-resultados]");
    const list = form.querySelector("[data-rsvp-lista]");
    const finish = form.querySelector("[data-rsvp-finalizar]");
    const mobile = form.querySelector("#rsvp-celular");
    const challengeText = form.querySelector("[data-rsvp-desafio]");
    const challengeInput = form.querySelector("#rsvp-verificacao");
    const honeypot = form.querySelector("#rsvp-site");
    const success = modal.querySelector("[data-rsvp-sucesso]");
    const header = modal.querySelector("[data-rsvp-cabecalho]");

    const initialStatus = status.textContent;

    // Resultado certo da conta exibida na verificação
    let challengeAnswer = 0;

    // Momento em que o modal foi aberto, para detectar envio rápido demais
    let openedAt = 0;

    // Contador que dá um nome único aos campos de cada convidado adicionado
    let guestCounter = 0;

    // Sorteia uma conta simples. Isso barra robôs básicos, mas é só uma primeira camada:
    // como roda no navegador, a validação definitiva precisará ser feita no back-end.
    const newChallenge = () => {
        const first = Math.floor(Math.random() * 9) + 1;
        const second = Math.floor(Math.random() * 9) + 1;
        challengeAnswer = first + second;
        challengeText.textContent = `${first} + ${second}`;
    };

    // Nomes que já estão na lista, para não aparecerem de novo na busca
    const getAddedNames = () => [...list.children].map((card) => card.dataset.nome);

    // Limpa a busca, para a pessoa poder pesquisar o próximo nome
    const clearSearch = (message) => {
        searchInput.value = "";
        results.replaceChildren();
        status.textContent = message;
    };

    const removeGuest = (card) => {
        card.remove();
        finish.hidden = list.children.length === 0;
        status.textContent = initialStatus;
        searchInput.focus();
    };

    // Cria o bloco do convidado a partir do template do HTML
    const addGuest = (name) => {
        const card = template.content.firstElementChild.cloneNode(true);
        const fieldName = `presenca-${guestCounter}`;
        const fieldId = `restricoes-${guestCounter}`;
        const removeButton = card.querySelector("[data-convidado-remover]");
        const restrictions = card.querySelector("[data-convidado-restricoes]");
        const firstOption = card.querySelector("[data-convidado-presenca]");

        guestCounter += 1;
        card.dataset.nome = name;

        // textContent garante que o nome nunca seja lido como HTML
        card.querySelector("[data-convidado-nome]").textContent = name;
        card.querySelector("[data-convidado-legenda]").textContent = `Presença de ${name}`;
        removeButton.setAttribute("aria-label", `Remover ${name}`);
        removeButton.addEventListener("click", () => removeGuest(card));

        // Cada convidado precisa de um grupo de opções próprio, senão as respostas se misturam
        card.querySelectorAll("[data-convidado-presenca]").forEach((option) => {
            option.name = fieldName;
        });

        card.querySelector("[data-convidado-restricoes-rotulo]").htmlFor = fieldId;
        card.querySelector("[data-convidado-restricoes-campo]").id = fieldId;

        // Campo de restrições some para quem marcou que não vai
        card.querySelector(".rsvp-opcoes").addEventListener("change", (event) => {
            restrictions.hidden = event.target.value !== "sim";
        });

        list.append(card);
        finish.hidden = false;
        clearSearch("Nome adicionado. Para incluir mais alguém, pesquise novamente.");

        // Leva a pessoa à resposta desse convidado. No celular, também fecha o teclado virtual
        firstOption.focus();
        card.scrollIntoView({ block: "nearest" });
    };

    // Monta a lista de resultados da busca
    const renderResults = (matches) => {
        const items = matches.map((name) => {
            const item = document.createElement("li");
            const button = document.createElement("button");
            const icon = document.createElement("i");
            const label = document.createElement("span");

            label.textContent = name;
            icon.className = "fa-solid fa-plus";
            icon.setAttribute("aria-hidden", "true");
            button.type = "button";
            button.className = "rsvp-resultado";
            button.append(label, icon);
            button.addEventListener("click", () => addGuest(name));
            item.append(button);
            return item;
        });
        results.replaceChildren(...items);
    };

    // Devolve os nomes que combinam com a busca e atualiza a mensagem de status
    const searchGuests = () => {
        const query = normalize(searchInput.value);

        if (query.length < minSearchLength) {
            status.textContent = initialStatus;
            return [];
        }

        const found = guests.filter((name) => normalize(name).includes(query));
        const added = getAddedNames();
        const matches = found.filter((name) => !added.includes(name));

        if (matches.length) {
            status.textContent = "Selecione o nome para adicionar à lista.";
        } else if (found.length) {
            status.textContent = "Este nome já está na lista abaixo.";
        } else {
            status.textContent = "Nenhum nome encontrado. Confira a grafia ou fale com a cerimonialista.";
        }

        return matches;
    };

    searchInput.addEventListener("input", () => renderResults(searchGuests()));

    // Enter na busca nunca envia o formulário. Com um único resultado, já adiciona o nome
    searchInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();

        const matches = searchGuests();
        if (matches.length === 1) addGuest(matches[0]);
    });

    // setCustomValidity integra as regras próprias às mensagens nativas do navegador.
    // Campo vazio fica sem mensagem própria porque o required já cuida desse caso.
    mobile.addEventListener("input", () => {
        const digits = getDigits(mobile.value).slice(0, 11);
        mobile.value = formatMobile(digits);
        mobile.setCustomValidity(digits && !mobilePattern.test(digits)
            ? "Digite um celular válido, com DDD. Ex.: (49) 99999-9999"
            : "");
    });

    challengeInput.addEventListener("input", () => {
        const answer = challengeInput.value.trim();
        challengeInput.setCustomValidity(answer && Number(answer) !== challengeAnswer
            ? "Resultado incorreto. Confira a conta."
            : "");
    });

    // Volta o modal ao estado inicial
    const resetForm = () => {
        form.reset();
        list.replaceChildren();
        clearSearch(initialStatus);
        mobile.setCustomValidity("");
        challengeInput.setCustomValidity("");
        finish.hidden = true;
        form.hidden = false;
        header.hidden = false;
        success.hidden = true;
        newChallenge();
    };

    // Deixa só a logo e a mensagem. O formulário pode estar rolado, então o modal volta ao topo
    const showSuccess = () => {
        form.hidden = true;
        header.hidden = true;
        success.hidden = false;
        modal.scrollTop = 0;
        success.focus();
    };

    // O navegador só dispara este evento depois de validar os campos obrigatórios
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const isBot = honeypot.value !== "" || Date.now() - openedAt < minFillTime;

        const responses = [...list.children].map((card) => {
            const isAttending = card.querySelector("[data-convidado-presenca]:checked").value === "sim";
            return {
                nome: card.dataset.nome,
                presenca: isAttending ? "sim" : "nao",
                // O texto digitado antes de trocar para "não vou" é descartado
                restricoes: isAttending ? card.querySelector("[data-convidado-restricoes-campo]").value.trim() : "",
            };
        });

        // Robô recebe a mesma tela de sucesso: sem saber que foi barrado, não tenta contornar
        if (!isBot) {
            sendRsvp({ celular: getDigits(mobile.value), respostas: responses });
        }

        showSuccess();
    });

    document.querySelectorAll("[data-rsvp-abrir]").forEach((button) => {
        button.addEventListener("click", () => {
            openedAt = Date.now();
            modal.showModal();
            searchInput.focus();
        });
    });

    modal.querySelectorAll("[data-rsvp-fechar]").forEach((button) => {
        button.addEventListener("click", () => modal.close());
    });

    // O clique no fundo escuro tem o próprio dialog como alvo, mas só fora da área do conteúdo
    modal.addEventListener("click", (event) => {
        if (event.target !== modal) return;
        const box = modal.getBoundingClientRect();
        const isInside = event.clientX >= box.left && event.clientX <= box.right
            && event.clientY >= box.top && event.clientY <= box.bottom;
        if (!isInside) modal.close();
    });

    // Depois de uma resposta enviada, a próxima abertura começa do zero
    modal.addEventListener("close", () => {
        if (!success.hidden) resetForm();
    });

    newChallenge();
}
