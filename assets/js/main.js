/* ══════════════════════════════════════════════════════════════
   AUMELY — SITE DE PRÉSENTATION
   Aucune bibliothèque : tout repose sur IntersectionObserver et
   sur une seule boucle de rendu synchronisée à l'écran.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     LE SEUL RÉGLAGE À CHANGER LE JOUR DE LA PUBLICATION

     Colle ici l'adresse de la fiche App Store d'Aumely, entre les
     apostrophes, à la place de null. Exemple :

       var URL_APP_STORE = 'https://apps.apple.com/fr/app/aumely/id1234567890';

     Rien d'autre à modifier : les quatre boutons du site pointeront
     alors tous vers cette adresse, et s'ouvriront dans un nouvel onglet.

     Tant que la valeur reste null, aucun bouton ne ment : ils mènent à
     la section tarif plutôt que vers un lien mort ou une fiche
     inexistante.
     ═══════════════════════════════════════════════════════════ */
  var URL_APP_STORE = null;

  var mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════════════════════
     1. Liens de téléchargement
     ═══════════════════════════════════════════════════════════ */
  function initLiensAppStore() {
    var liens = document.querySelectorAll('[data-appstore]');
    var prete = typeof URL_APP_STORE === 'string' && URL_APP_STORE.indexOf('http') === 0;

    for (var i = 0; i < liens.length; i++) {
      if (prete) {
        liens[i].href = URL_APP_STORE;
        liens[i].target = '_blank';
        liens[i].rel = 'noopener noreferrer';
        liens[i].removeAttribute('aria-describedby');
      } else {
        // Aucun lien mort tant que la fiche n'existe pas : on ramène
        // simplement le visiteur à l'offre.
        liens[i].href = '#tarif';
        liens[i].removeAttribute('target');
        liens[i].removeAttribute('rel');
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
      // Un seuil en pourcentage laisserait de côté les éléments plus hauts
      // que l'écran — un iPhone en pied de héros n'en montre jamais 12 %.
      // On déclenche donc dès qu'un élément est entré d'une centaine de
      // pixels, quelle que soit sa taille.
    }, { rootMargin: '0px 0px -90px 0px', threshold: 0 });

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
     4. Parcours épinglés
     L'iPhone reste fixé pendant que les écrans se relaient.

     La page en compte deux : la section « Votre métier » et le
     parcours des fonctionnalités. Le même moteur les anime tous
     les deux — il suffit qu'une section porte data-scroller et
     contienne des .step, des .screen et des [data-dot].
     ═══════════════════════════════════════════════════════════ */
  function initParcours() {
    var sections = document.querySelectorAll('[data-scroller]');
    for (var s = 0; s < sections.length; s++) animerParcours(sections[s]);
  }

  function animerParcours(section) {
    var etapes  = section.querySelectorAll('.step');
    var ecrans  = section.querySelectorAll('.screen');
    var points  = section.querySelectorAll('[data-dot]');
    var nombre  = etapes.length;
    if (!nombre) return;

    // Part du défilement pendant laquelle deux captures se croisent.
    // Court : la transition doit être franche, pas molle.
    var FONDU = 0.34;

    var actif = -1;

    /// Adoucit une progression 0→1 : démarrage et arrivée sans à-coup.
    function adoucir(t) {
      return t * t * (3 - 2 * t);
    }

    /// Le texte, lui, ne se croise pas : il bascule d'un bloc à l'autre.
    function activerTexte(index) {
      if (index === actif) return;
      actif = index;

      // Sert au CSS : la section « Votre métier » change de teinte
      // d'ambiance selon le métier affiché.
      section.setAttribute('data-actif', index);

      for (var i = 0; i < nombre; i++) {
        var estActif = (i === index);
        if (etapes[i]) etapes[i].classList.toggle('is-active', estActif);
        if (points[i]) {
          points[i].classList.toggle('is-active', estActif);
          if (points[i].tagName === 'BUTTON') {
            points[i].setAttribute('aria-current', estActif ? 'true' : 'false');
          }
        }
      }
    }

    /// Les captures, elles, se fondent l'une dans l'autre en continu :
    /// c'est ce qui fait la différence entre « ça change » et « ça glisse ».
    function peindreEcrans(index, fraction) {
      for (var i = 0; i < nombre; i++) {
        var ecran = ecrans[i];
        if (!ecran) continue;

        var opacite = 0;
        var echelle = 1.05;

        if (i === index) {
          // Sortante sur la fin du segment — sauf pour la dernière, qui n'a
          // aucune capture pour la relayer : elle resterait sur un écran vide.
          var sortie = (fraction > (1 - FONDU) && index + 1 < nombre)
            ? adoucir((fraction - (1 - FONDU)) / FONDU)
            : 0;
          opacite = 1 - sortie;
          echelle = 1 + sortie * 0.03;
        } else if (i === index + 1) {
          // Entrante sur cette même fin de segment.
          var entree = fraction > (1 - FONDU)
            ? adoucir((fraction - (1 - FONDU)) / FONDU)
            : 0;
          opacite = entree;
          echelle = 1.05 - entree * 0.05;
        }

        if (opacite <= 0.001) {
          ecran.style.opacity = '0';
          ecran.style.visibility = 'hidden';       // rien à composer hors champ
        } else {
          ecran.style.opacity = opacite.toFixed(3);
          ecran.style.visibility = 'visible';
          ecran.style.transform = 'scale(' + echelle.toFixed(4) + ')';
        }
      }
    }

    /// Hauteur réellement parcourue par le doigt pendant que la scène
    /// reste épinglée. Sert au calcul du défilement et aux raccourcis.
    function hauteurUtile(rect) {
      return rect.height - window.innerHeight;
    }

    function calculer() {
      var rect = section.getBoundingClientRect();
      var hauteurDefilable = hauteurUtile(rect);

      if (hauteurDefilable <= 0) {
        activerTexte(0);
        peindreEcrans(0, 0);
        return;
      }

      var avancement = (-rect.top) / hauteurDefilable;
      if (avancement < 0) avancement = 0;
      if (avancement > 1) avancement = 1;

      var position = avancement * nombre;
      var index = Math.floor(position);
      if (index > nombre - 1) index = nombre - 1;
      var fraction = position - index;

      // Le texte bascule au moment où la capture entrante prend le dessus.
      activerTexte(fraction > (1 - FONDU / 2) && index < nombre - 1
                   ? index + 1
                   : index);
      peindreEcrans(index, fraction);
    }

    /* Repères cliquables : dans la section « Votre métier », la liste
       des activités est faite de vrais boutons. Le visiteur va droit
       à la sienne au lieu de dérouler les autres. */
    function initRaccourcis() {
      for (var i = 0; i < points.length; i++) {
        if (points[i].tagName !== 'BUTTON') continue;
        points[i].addEventListener('click', (function (cible) {
          return function () {
            var rect = section.getBoundingClientRect();
            var hauteurDefilable = hauteurUtile(rect);
            if (hauteurDefilable <= 0) return;

            var hautSection = window.scrollY + rect.top;
            // Milieu du segment : bien après le fondu d'entrée, bien
            // avant celui de sortie.
            var vise = hautSection
                     + (cible + 0.45) * (hauteurDefilable / nombre);

            window.scrollTo({
              top: Math.round(vise),
              behavior: mouvementReduit ? 'auto' : 'smooth'
            });
          };
        })(i));
      }
    }

    activerTexte(0);
    peindreEcrans(0, 0);
    initRaccourcis();
    lierAuDefilement(calculer);
  }

  /* ═══════════════════════════════════════════════════════════
     5. Passation du héros
     L'appareil d'ouverture s'éloigne doucement quand on quitte le
     premier écran, au lieu de simplement défiler hors champ. C'est
     ce mouvement qui donne l'impression de « passer la main » à la
     section suivante.
     ═══════════════════════════════════════════════════════════ */
  function initHeros() {
    var appareil = document.querySelector('.phone--hero');
    var heros = document.querySelector('.hero');
    if (!appareil || !heros) return;

    if (mouvementReduit) return;

    function placer() {
      var hauteur = heros.offsetHeight;
      if (hauteur <= 0) return;

      // 0 en haut de page, 1 lorsque le héros est entièrement dépassé.
      var avancement = window.scrollY / hauteur;
      if (avancement < 0) avancement = 0;
      if (avancement > 1) avancement = 1;

      // Volontairement faible : l'appareil recule, il ne s'envole pas.
      var recul   = avancement * 0.10;
      var montee  = avancement * -46;
      var opacite = 1 - avancement * 0.55;

      appareil.style.transform =
        'translate3d(0,' + montee.toFixed(1) + 'px,0) scale(' + (1 - recul).toFixed(4) + ')';
      appareil.style.opacity = opacite.toFixed(3);
    }

    lierAuDefilement(placer);
  }

  /* ═══════════════════════════════════════════════════════════
     6. Parallaxe discrète
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
    initHeros();
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
