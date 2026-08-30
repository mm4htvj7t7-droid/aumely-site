# Site de présentation Aumely — V2

Version 2 du site, centrée sur le positionnement :
**« L'application qui s'adapte à votre activité. »**

---

## ⏪ Revenir à l'ancienne version (V1)

Deux sauvegardes indépendantes existent. **Aucune n'a été supprimée.**

**1. Copie complète du dossier** (la plus simple, aucune commande à
comprendre) :

    ~/Desktop/Aumely_Site_SAUVEGARDE_V1_20260830

C'est le site tel qu'il était avant la V2, fichier pour fichier.
Pour revenir dessus : renommer `Aumely_Site` en `Aumely_Site_V2`, puis
renommer la sauvegarde en `Aumely_Site`.

**2. Repère dans l'historique Git**, à l'intérieur du dossier du site :

    git checkout v1-avant-refonte-20260830 -- .

La branche `version-v1-sauvegarde` pointe elle aussi sur cette même version.

Il suffit donc de dire à Claude : **« Reviens à l'ancienne version »**.

---

## Lancer le site

Depuis ce dossier :

    python3 -m http.server 8080

Puis ouvrir http://localhost:8080 dans un navigateur.
Pour arrêter : Ctrl-C dans le Terminal.

---

## Le parcours de la page

La page raconte une histoire, dans cet ordre :

1. **Héros** — Aumely s'adapte à votre activité.
2. **Votre métier** — artisan, commerce et e-commerce, profession libérale,
   agriculture. L'iPhone reste épinglé et son écran d'accueil change de métier
   au fil du défilement.
3. **Dix choses à gérer** — les neuf outils réunis dans une seule application.
4. **Les fonctionnalités** — recettes, dépenses, clients, rendez-vous,
   devis et factures, en parcours épinglé.
5. **Une facture qui vous ressemble** — le logo de l'entreprise.
6. **Analyses** — la vision claire de l'activité.
7. **Facturation électronique** — importante, mais une brique parmi d'autres.
8. **Tarif** — 4,99 €/mois, 14 jours gratuits, sans engagement.
9. **Conclusion** — Votre activité. Clair. Simple. Serein.

---

## Ce qu'il y a dedans

    index.html            la page entière
    assets/css/style.css  toute la mise en forme
    assets/js/main.js     les animations au défilement
    assets/img/           les captures d'écran de l'application
    assets/icon/          l'icône de l'application

Aucune bibliothèque extérieure, aucune étape de compilation : on modifie un
fichier, on recharge la page. La seule ressource distante est la police
(Google Fonts).

---

## Les captures d'écran

Les PNG d'`assets/img/` sont les **fichiers d'origine, intacts** (1206 × 2622).
Leur contenu n'a jamais été retouché : aucun texte, aucun chiffre, aucune
icône, aucune couleur n'a été changé.

À côté de chaque PNG se trouve un `.webp` : la **même image, réduite
proportionnellement à 800 px de large**, servie aux navigateurs qui la
comprennent (la quasi-totalité). C'est deux fois la taille d'affichage réelle,
donc net sur écran retina, et cela fait passer le poids de la page de 4,5 Mo à
**816 Ko** — dont seulement **173 Ko pour le premier écran**.

Pour changer une capture : remplacer le PNG dans `assets/img/` en gardant le
même nom, régénérer le WebP correspondant, et mettre à jour son texte
alternatif dans `index.html`.

---

## À faire avant la mise en ligne

1. **Lien App Store** — ouvrir `assets/js/main.js`, tout en haut :

       var URL_APP_STORE = null;

   Y mettre l'adresse réelle de la fiche App Store. Tant que la valeur est
   `null`, les cinq boutons du site renvoient vers la section tarif plutôt que
   vers un lien mort. **C'est le seul réglage à changer le jour de la
   publication.**

2. **Domaine** — le fichier `CNAME.a-activer-apres-dns` contient `aumely.com`.
   Le renommer en `CNAME` une fois les DNS basculés chez OVH.

---

## Envoyer le prototype à quelqu'un

    python3 construire-fichier-unique.py

Crée `~/Desktop/Aumely_Prototype.html` : un seul fichier contenant la page,
les styles, les animations et les captures. À envoyer par mail, AirDrop ou
WeTransfer. La personne double-clique dessus et la page s'ouvre dans son
navigateur — aucun compte, aucun serveur, aucune installation.
