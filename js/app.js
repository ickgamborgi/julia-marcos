// Ponto de entrada do JS: só importa e inicializa os módulos.

import { initHeader } from "./modules/header.js";
import { initHero } from "./modules/hero.js";
import { initAnimations } from "./modules/animations.js";
import { initRsvp } from "./modules/rsvp.js";
import { initCounter } from "./modules/counter.js";
import { initGallery } from "./modules/gallery.js";
import { initFaq } from "./modules/faq.js";
import { initTracking } from "./modules/tracking.js";

document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initHero();
    initAnimations();
    initRsvp();
    initCounter();
    initGallery();
    initFaq();
    initTracking();
});
