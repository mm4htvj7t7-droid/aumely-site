# Site Aumely — V3

Site multi-pages : accueil, fonctionnalités, pour qui, tarifs, ressources,
FAQ, à propos, contact, assistance, confidentialité, page introuvable.

---

## ⏪ Revenir à une version précédente

**Rien n'a été supprimé.** Trois versions coexistent.

| Version | Ce que c'était | Dossier de sauvegarde | Repère Git |
|---|---|---|---|
| **V1** | Page unique, « Votre activité. Clair. Simple. Serein. » | `~/Desktop/Aumely_Site_SAUVEGARDE_V1_20260830` | `v1-avant-refonte-20260830` |
| **V2** | Page unique, « L'application qui s'adapte à votre activité » | `~/Desktop/Aumely_Site_SAUVEGARDE_V2_20260830` | `v2-avant-refonte-site-20260830` |
| **V3** | Ce site multi-pages | — | `main` |

**Pour revenir en arrière**, le plus simple est de le demander :
« Reviens à la V2 » ou « Reviens à l'ancienne version ».

À la main, avec le dossier : renommer `Aumely_Site` en `Aumely_Site_V3`,
puis renommer la sauvegarde voulue en `Aumely_Site`.

À la main, avec Git, depuis le dossier du site :

    git checkout v2-avant-refonte-site-20260830 -- .

Les branches `version-v1-sauvegarde` et `version-v2-sauvegarde` pointent
sur ces mêmes versions, et sont aussi sur GitHub.

---

## Lancer le site

Depuis ce dossier :

    python3 -m http.server 8080

Puis ouvrir http://localhost:8080

---

## ⚠️ Modifier le site : passer par `_source/`

Les pages HTML à la racine sont **fabriquées**. Les modifier directement
serait écrasé à la prochaine construction.

    _source/gabarit.html   ← l'en-tête, le menu, le pied de page, le
                             dernier appel à l'action. Écrits UNE fois,
                             pour les onze pages.
    _source/pages/*.html   ← le contenu propre à chaque page.

Après toute modification :

    python3 construire-site.py

Le script réécrit les pages finies à la racine. Ce sont elles qui sont
publiées.

**Pourquoi ce détour ?** Sans lui, la navigation existerait en onze
exemplaires, et un changement de menu obligerait à corriger onze fichiers.
Un menu désynchronisé d'une page à l'autre est exactement ce qui fait
« site bricolé ».

### En-tête d'une page source

    titre: Tarifs — Aumely, 4,99 € par mois
    description: Une phrase pour Google et pour les partages.
    fichier: tarifs.html
    onglet: ressources        (facultatif — quel onglet du menu s'allume)
    ---
    <section> … le contenu … </section>

---

## ✅ À faire le jour de la mise en ligne

### 1. Le lien App Store

**Une seule ligne à changer**, en haut de `assets/js/site.js` :

    var URL_APP_STORE = null;

Y coller l'adresse de la fiche App Store. Tous les boutons du site, sur
toutes les pages, y conduiront alors dans un nouvel onglet.

Ensuite, retirer l'encadré « Aumely arrive sur l'App Store » dans
`_source/pages/tarifs.html` (il est repérable, entouré d'un commentaire),
puis relancer `python3 construire-site.py`.

Tant que la valeur reste `null`, aucun bouton ne mène à un lien mort :
ils ramènent à la page Tarifs, et sur cette page à l'encadré qui explique
où en est la mise en ligne.

### 2. ⚠️ Vérifier que le mail arrive vraiment

Le site écrit à **contact@aumely.com** — page Contact, page Assistance,
pied de page, et le formulaire.

**Avant la mise en ligne, faire ce test :**

1. Envoyer un message à `contact@aumely.com` depuis une autre adresse.
2. Vérifier qu'il arrive bien dans la boîte relevée tous les jours.

Si rien n'arrive, l'alias n'existe pas encore : le créer dans l'espace
client **OVH** (les MX du domaine pointent bien sur OVH, le domaine
reçoit donc du courrier — c'est l'alias `contact@` qui doit exister).

**Pour changer d'adresse**, une seule ligne dans `assets/js/site.js` :

    var boite = ['contact', 'aumely.com'].join('@');

… et les liens visibles `mailto:` dans `_source/pages/contact.html`,
`_source/pages/support.html` et `_source/gabarit.html`.

### 3. Ce que le formulaire fait, et ne fait pas

Il **n'envoie rien lui-même** : un site statique n'a pas de serveur pour
cela. Il ouvre la messagerie du visiteur avec un message déjà rédigé et
déjà adressé ; c'est le visiteur qui appuie sur Envoyer.

Pour un vrai envoi depuis le site, il faudrait brancher un service tiers
(Brevo est déjà présent sur le domaine, ou Formspree).

---

## Les deux pages exigées par Apple

`confidentialite.html` et `support.html` sont déclarées dans App Store
Connect. Elles gardent leurs adresses et restent accessibles.

- **Confidentialité** : le texte a été repris **au caractère près**,
  seule la mise en page a changé. Vérifié par comparaison automatique.
- **Assistance** : le formulaire de contact fonctionne à l'identique
  (il ouvre un message dans la messagerie du visiteur, adressé à
  `aumely@outlook.fr`, adresse qui n'apparaît jamais à l'écran).
  La page a gagné une rubrique « Avant de nous écrire ».

Ne jamais supprimer ces deux fichiers ni changer leur nom.

---

## Les captures d'écran

Les PNG d'`assets/img/` sont les **fichiers d'origine** de l'application
(1206 × 2622). Aucun contenu n'a été retouché : ni texte, ni chiffre, ni
icône, ni couleur.

À côté de chaque PNG, un `.webp` : la **même image réduite
proportionnellement à 800 px de large**, servie aux navigateurs qui la
comprennent — soit la quasi-totalité. C'est deux fois la taille
d'affichage, donc net sur écran retina.

Résultat : la page la plus lourde du site fait **559 Ko**, et le premier
écran de l'accueil environ **150 Ko**.

Pour remplacer une capture : déposer le nouveau PNG sous le même nom,
régénérer le WebP correspondant, et mettre à jour son texte alternatif
dans la page source.

---

## Ce que le site ne fait pas (et pourquoi)

- **Pas de bouton « Se connecter »** : Aumely n'a pas d'espace client sur
  le web. Le compte se gère dans l'application. Un bouton qui mène à une
  page vide fait plus de mal qu'il ne rassure.
- **Pas d'articles de blog inventés** : la rubrique Ressources annonce
  ce qui est en préparation plutôt que de se remplir de textes creux.
- **Aucune fonctionnalité annoncée qui n'existe pas.** Chaque affirmation
  du site a été vérifiée dans le code de l'application. Ce qui n'est pas
  encore ouvert — l'émission des factures électroniques, une version Mac —
  est écrit noir sur blanc.
