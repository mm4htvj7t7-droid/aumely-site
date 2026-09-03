/* ══════════════════════════════════════════════════════════════
   AUMELY — SCRIPT DU SITE
   Aucune bibliothèque. Trois choses seulement : les liens de
   téléchargement, le menu mobile, et les apparitions au
   défilement. Le site reste entièrement lisible sans ce fichier.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     LE SEUL RÉGLAGE À CHANGER LE JOUR DE LA PUBLICATION

     Colle ici l'adresse de la fiche App Store d'Aumely, entre les
     apostrophes, à la place de null. Exemple :

       var URL_APP_STORE = 'https://apps.apple.com/fr/app/aumely/id1234567890';

     Rien d'autre à modifier : TOUS les boutons du site, sur TOUTES
     les pages, pointeront alors vers cette adresse.

     Tant que la valeur reste null, aucun bouton ne ment : ils
     mènent à la page Tarifs plutôt que vers un lien mort.
     ═══════════════════════════════════════════════════════════ */
  var URL_APP_STORE = "https://apps.apple.com/fr/app/id6804767478";

  var mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════════════════════
     1. Liens de téléchargement
     ═══════════════════════════════════════════════════════════ */
  function initTelechargement() {
    var liens = document.querySelectorAll('[data-appstore]');
    var prete = typeof URL_APP_STORE === 'string' && URL_APP_STORE.indexOf('http') === 0;
    var racine = document.documentElement.getAttribute('data-racine') || '';
    var surLaPageTarifs = !!document.getElementById('disponibilite');

    for (var i = 0; i < liens.length; i++) {
      if (prete) {
        liens[i].href = URL_APP_STORE;
        liens[i].target = '_blank';
        liens[i].rel = 'noopener noreferrer';
      } else {
        // Tant que la fiche n'existe pas, aucun bouton ne ment : ils
        // ramènent à l'offre. Sur la page Tarifs elle-même, où ce
        // renvoi ne ferait rien du tout, ils mènent à l'encadré qui
        // dit où en est la mise en ligne.
        liens[i].href = surLaPageTarifs ? '#disponibilite' : racine + 'tarifs.html';
        liens[i].removeAttribute('target');
        liens[i].removeAttribute('rel');
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════
     2. Menu mobile
     ═══════════════════════════════════════════════════════════ */
  function initMenu() {
    var bouton = document.getElementById('burger');
    var menu = document.getElementById('menu');
    if (!bouton || !menu) return;

    function fermer() {
      bouton.setAttribute('aria-expanded', 'false');
      menu.classList.remove('est-ouvert');
      document.body.classList.remove('menu-ouvert');
    }

    function basculer() {
      var ouvert = bouton.getAttribute('aria-expanded') === 'true';
      if (ouvert) { fermer(); return; }
      bouton.setAttribute('aria-expanded', 'true');
      menu.classList.add('est-ouvert');
      document.body.classList.add('menu-ouvert');
    }

    bouton.addEventListener('click', basculer);

    // Un lien cliqué mène à une autre page : le menu ne doit pas
    // rester ouvert par-dessus, ni bloquer le défilement au retour.
    var liens = menu.querySelectorAll('a');
    for (var i = 0; i < liens.length; i++) liens[i].addEventListener('click', fermer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fermer();
    });

    // Repasser en affichage large referme le panneau, sinon il
    // resterait visible sans bouton pour le refermer.
    var large = window.matchMedia('(min-width: 1000px)');
    if (large.addEventListener) {
      large.addEventListener('change', function (e) { if (e.matches) fermer(); });
    }
  }

  /* ═══════════════════════════════════════════════════════════
     3. Apparitions au défilement
     ═══════════════════════════════════════════════════════════ */
  function initApparitions() {
    var elements = document.querySelectorAll('.monte');

    for (var i = 0; i < elements.length; i++) {
      var d = elements[i].getAttribute('data-d');
      if (d) elements[i].style.setProperty('--d', d);
    }

    if (mouvementReduit || !('IntersectionObserver' in window)) {
      for (var j = 0; j < elements.length; j++) elements[j].classList.add('est-vu');
      return;
    }

    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) return;
        entree.target.classList.add('est-vu');
        observateur.unobserve(entree.target);      // une seule fois
      });
      // Un seuil en pourcentage laisserait de côté les éléments plus
      // hauts que l'écran : on déclenche dès qu'un élément est entré
      // d'une centaine de pixels, quelle que soit sa taille.
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0 });

    for (var k = 0; k < elements.length; k++) observateur.observe(elements[k]);
  }

  /* ═══════════════════════════════════════════════════════════
     4. Formulaire de contact

     ADRESSE DE DESTINATION : la ligne `var boite` ci-dessous. Elle
     vaut pour la page Contact ET pour la page Assistance.

     Le formulaire n'envoie rien lui-même : un site statique n'a pas
     de serveur pour cela. Il ouvre la messagerie du visiteur avec un
     message déjà rédigé et déjà adressé ; c'est lui qui l'envoie.

     L'adresse est écrite en deux morceaux réassemblés à l'exécution :
     les robots qui aspirent les adresses dans le code des pages ne la
     ramassent pas telle quelle.
     ═══════════════════════════════════════════════════════════ */
  function initFormulaire() {
    var formulaire = document.getElementById('formulaire-contact');
    if (!formulaire) return;

    var aide = document.getElementById('formulaire-aide');
    var boite = ['contact', 'aumely.com'].join('@');

    formulaire.addEventListener('submit', function (evenement) {
      evenement.preventDefault();

      var sujet = document.getElementById('sujet').value.trim();
      var email = document.getElementById('email').value.trim();
      var message = document.getElementById('message').value.trim();

      if (!sujet || !email || !message) {
        aide.textContent = 'Merci de remplir les trois champs avant d’envoyer.';
        return;
      }
      if (email.indexOf('@') < 1 || email.indexOf('.') < 0) {
        aide.textContent = 'Cette adresse e-mail ne semble pas valide.';
        return;
      }

      var corps = message + '\n\n—\nRépondre à : ' + email;
      var lien = 'mailto:' + boite +
        '?subject=' + encodeURIComponent('Aumely — ' + sujet) +
        '&body=' + encodeURIComponent(corps);

      aide.textContent = 'Votre message s’ouvre dans votre application de messagerie…';
      window.location.href = lien;
    });
  }

  /* ═══════════════════════════════════════════════════════════
     Démarrage
     ═══════════════════════════════════════════════════════════ */
  function demarrer() {
    initTelechargement();
    initMenu();
    initApparitions();
    initFormulaire();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
