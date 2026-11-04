// Ponto de entrada do JS da página do traje: só inicializa o que existe nela.
// Fica separado do app.js porque hero, RSVP, contagem, galeria e FAQ são exclusivos da home.

import { initHeader } from "./modules/header.js";
import { initAnimations } from "./modules/animations.js";
import { initTracking } from "./modules/tracking.js";

document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initAnimations();
    initTracking();
});
