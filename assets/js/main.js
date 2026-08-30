/* ══════════════════════════════════════════════════════════════
   AUMELY — SITE DE PRÉSENTATION
   Aucune bibliothèque : tout repose sur IntersectionObserver et
   sur une seule boucle de rendu synchronisée à l'écran.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ───────────────────────────────────────────────────────────
     À REMPLACER LE JOUR DE LA MISE EN LIGNE
     L'adresse définitive de la fiche App Store d'Aumely.
     Tant qu'elle vaut null, les boutons ramènent à la section
     tarif : aucun lien mort, aucune promesse non tenue.
     ─────────────────────────────────────────────────────────── */
  var URL_APP_STORE = null;   // ex. 'https://apps.apple.com/fr/app/aumely/id0000000000'

  var mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════════════════════
     1. Liens de téléchargement
     ═══════════════════════════════════════════════════════════ */
  function initLiensAppStore() {
    var liens = document.querySelectorAll('[data-appstore]');
    for (var i = 0; i < liens.length; i++) {
      if (URL_APP_STORE) {
        liens[i].href = URL_APP_STORE;
        liens[i].target = '_blank';
        liens[i].rel = 'noopener';
      } else {
        liens[i].href = '#tarif';
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════
     2. Apparitions au défilement
     ═══════════════════════════════════════════════════════════ */
  function initApparitions() {
    var elements = document.querySelectorAll('.reveal');

    // Le délai est porté par l'attribut data-delay et relayé au CSS.
    for (var i = 0; i < elements.length; i++) {
      var d = elements[i].getAttribute('data-delay');
      if (d) elements[i].style.setProperty('--d', d);
    }

    if (mouvementReduit || !('IntersectionObserver' in window)) {
      for (var j = 0; j < elements.length; j++) elements[j].classList.add('is-in');
      return;
    }

    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) return;
        entree.target.classList.add('is-in');
        observateur.unobserve(entree.target);   // une seule fois : pas de clignotement
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    for (var k = 0; k < elements.length; k++) observateur.observe(elements[k]);
  }

  /* ═══════════════════════════════════════════════════════════
     3. Barre de navigation
     Elle n'apparaît qu'une fois le héros dépassé.
     ═══════════════════════════════════════════════════════════ */
  function initBarre() {
    var barre = document.getElementById('topbar');
    var hero = document.querySelector('.hero');
    if (!barre || !hero || !('IntersectionObserver' in window)) return;

    var observateur = new IntersectionObserver(function (entrees) {
      barre.classList.toggle('is-visible', !entrees[0].isIntersecting);
    }, { threshold: 0, rootMargin: '-70% 0px 0px 0px' });

    observateur.observe(hero);
  }

  /* ═══════════════════════════════════════════════════════════
     4. Parcours épinglé
     L'iPhone reste fixé pendant que les écrans se relaient.
     ═══════════════════════════════════════════════════════════ */
  function initParcours() {
    var section = document.querySelector('[data-scroller]');
    if (!section) return;

    var etapes  = section.querySelectorAll('.step');
    var ecrans  = section.querySelectorAll('.screen');
    var points  = section.querySelectorAll('[data-dot]');
    var nombre  = etapes.length;
    if (!nombre) return;

    var actif = -1;

    function activer(index) {
      if (index === actif) return;             // rien à faire : évite tout travail inutile
      actif = index;
      for (var i = 0; i < nombre; i++) {
        var estActif = (i === index);
        if (etapes[i]) etapes[i].classList.toggle('is-active', estActif);
        if (ecrans[i]) ecrans[i].classList.toggle('is-active', estActif);
        if (points[i]) points[i].classList.toggle('is-active', estActif);
      }
    }

    function calculer() {
      var rect = section.getBoundingClientRect();
      var hauteurDefilable = rect.height - window.innerHeight;

      // Avant la section, ou section trop courte : on montre la première.
      if (hauteurDefilable <= 0) { activer(0); return; }

      var avancement = (-rect.top) / hauteurDefilable;      // 0 → 1
      var index = Math.floor(avancement * nombre);

      if (index < 0) index = 0;
      if (index > nombre - 1) index = nombre - 1;

      activer(index);
    }

    activer(0);
    lierAuDefilement(calculer);
  }

  /* ═══════════════════════════════════════════════════════════
     5. Parallaxe discrète
     Quelques pixels seulement : de la profondeur, pas du mouvement.
     ═══════════════════════════════════════════════════════════ */
  function initParallaxe() {
    if (mouvementReduit) return;

    var cibles = document.querySelectorAll('[data-parallax]');
    if (!cibles.length) return;

    // Sous 900 px, la parallaxe n'apporte rien et coûte des images/seconde.
    var grandEcran = window.matchMedia('(min-width: 900px)');

    function placer() {
      if (!grandEcran.matches) {
        for (var i = 0; i < cibles.length; i++) cibles[i].style.transform = '';
        return;
      }
      var milieu = window.innerHeight / 2;
      for (var j = 0; j < cibles.length; j++) {
        var cible = cibles[j];
        var rect = cible.getBoundingClientRect();

        // Hors champ : on ne calcule rien.
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;

        var centre = rect.top + rect.height / 2;
        var force = parseFloat(cible.getAttribute('data-parallax')) || 0;
        var decalage = (milieu - centre) * force;

        cible.style.transform = 'translate3d(0,' + decalage.toFixed(2) + 'px,0)';
      }
    }

    lierAuDefilement(placer);
  }

  /* ═══════════════════════════════════════════════════════════
     Boucle de rendu commune
     Tous les effets partagent la même image : le navigateur ne
     recalcule la mise en page qu'une fois par rafraîchissement.
     ═══════════════════════════════════════════════════════════ */
  var taches = [];
  var enAttente = false;

  function lierAuDefilement(tache) {
    taches.push(tache);
    tache();
  }

  function planifier() {
    if (enAttente) return;
    enAttente = true;
    window.requestAnimationFrame(function () {
      enAttente = false;
      for (var i = 0; i < taches.length; i++) taches[i]();
    });
  }

  /* ═══════════════════════════════════════════════════════════
     Démarrage
     ═══════════════════════════════════════════════════════════ */
  function demarrer() {
    initLiensAppStore();
    initApparitions();
    initBarre();
    initParcours();
    initParallaxe();

    window.addEventListener('scroll', planifier, { passive: true });
    window.addEventListener('resize', planifier, { passive: true });
    window.addEventListener('orientationchange', planifier, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
