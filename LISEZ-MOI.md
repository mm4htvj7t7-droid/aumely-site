# Site de présentation Aumely — prototype

Prototype **local uniquement**. Rien n'est en ligne, aucun domaine n'est branché,
aucun hébergement n'a été acheté.

## Lancer le site

Depuis ce dossier :

    python3 -m http.server 8080

Puis ouvrir http://localhost:8080 dans un navigateur.
Pour arrêter : Ctrl-C dans le Terminal.

## Ce qu'il y a dedans

    index.html            la page entière
    assets/css/style.css  toute la mise en forme
    assets/js/main.js     les animations au défilement
    assets/img/           les 13 captures d'écran retenues
    assets/icon/          l'icône de l'application

Aucune bibliothèque extérieure, aucune étape de compilation : on modifie un
fichier, on recharge la page. La seule ressource distante est la police
(Google Fonts).

## Les captures d'écran

Les 13 captures sont les **fichiers d'origine, copiés tels quels** depuis
`Aumely_Captures_Presentation`. Vérifié par empreinte SHA-256 : elles sont
identiques bit pour bit. Le CSS ne fait que les afficher dans un cadre d'iPhone
dessiné autour, en respectant exactement leur rapport largeur/hauteur
(1206 × 2622). Aucun recadrage, aucune déformation, aucune retouche.

Pour changer une capture : remplacer le fichier dans `assets/img/` en gardant
le même nom, et mettre à jour son texte alternatif dans `index.html`.

## Envoyer le prototype à quelqu'un

    python3 construire-fichier-unique.py

Crée `~/Desktop/Aumely_Prototype.html` : **un seul fichier** contenant la page,
les styles, les animations et les captures. À envoyer par mail, AirDrop ou
WeTransfer (environ 7,6 Mo). La personne double-clique dessus et la page
s'ouvre dans Safari ou Chrome — aucun compte, aucun serveur, aucune
installation.

Dans ce fichier, les captures sont réduites proportionnellement à 820 px de
large (au lieu de 1206) : c'est plus de deux fois la taille d'affichage réelle,
donc net sur écran retina, et cela divise le poids du fichier. Leur contenu
n'est pas modifié. Le prototype de ce dossier, lui, garde les fichiers
d'origine intacts.

Relancer le script après chaque modification du site pour régénérer le fichier.

## À faire avant la mise en ligne

1. **Lien App Store** — ouvrir `assets/js/main.js`, tout en haut :

       var URL_APP_STORE = null;

   Y mettre l'adresse réelle de la fiche App Store. Tant que la valeur est
   `null`, les boutons renvoient vers la section tarif plutôt que vers un lien
   mort.

2. **Pages légales** — les trois liens du bas de page (mentions légales,
   confidentialité, assistance) pointent encore vers `#`.

3. **Images** — elles pèsent environ 8 Mo au total. Elles sont volontairement
   laissées intactes. Au moment de la mise en ligne, on pourra servir des
   versions WebP en parallèle (sans supprimer les PNG d'origine) pour accélérer
   le chargement.
