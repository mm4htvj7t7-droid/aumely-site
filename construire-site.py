#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Assemble les pages du site à partir d'un seul gabarit.

POURQUOI CE SCRIPT
Le site compte huit pages qui partagent le même en-tête, le même menu
et le même pied de page. Sans ce script, il faudrait recopier la
navigation huit fois — et la corriger huit fois à chaque changement.
Une navigation désynchronisée est exactement ce qui fait « site
bricolé ». Ici, on écrit la navigation UNE fois, dans
`_source/gabarit.html`.

COMMENT L'UTILISER

    python3 construire-site.py

Le script lit `_source/gabarit.html` et chaque fichier de
`_source/pages/`, puis écrit les pages finies à la racine du site.
Ce sont ces fichiers-là qui sont publiés.

MODIFIER UN TEXTE
  → ouvrir le fichier correspondant dans `_source/pages/`,
    puis relancer le script.

MODIFIER LA NAVIGATION, L'EN-TÊTE OU LE PIED DE PAGE
  → ouvrir `_source/gabarit.html`, puis relancer le script.

Chaque fichier de `_source/pages/` commence par un petit bloc d'en-tête
au format `clé: valeur`, séparé du contenu par une ligne `---` :

    titre: Tarifs — Aumely
    description: 4,99 € par mois, 14 jours gratuits, sans engagement.
    fichier: tarifs.html
    ---
    <section> … le contenu de la page … </section>
"""

import hashlib
import io
import os
import re
import sys

RACINE = os.path.dirname(os.path.abspath(__file__))
SOURCE = os.path.join(RACINE, "_source")
PAGES = os.path.join(SOURCE, "pages")

# Les onglets de la navigation, dans l'ordre. La clé sert à marquer
# l'onglet de la page affichée (aria-current).
ONGLETS = ["index", "fonctionnalites", "pour-qui", "tarifs",
           "ressources", "a-propos", "contact"]


def lire(chemin):
    return io.open(chemin, encoding="utf-8").read()


def empreinte(chemin):
    """Huit caractères tirés du contenu du fichier.

    Sert à suffixer l'adresse de la feuille de style et du script
    (`site.css?v=ab12cd34`). Sans ça, un navigateur qui a déjà visité le
    site continue de servir SA copie : les corrections n'arrivent jamais
    chez les visiteurs déjà venus, et on croit à tort que la mise en
    ligne a échoué. Le suffixe change dès que le fichier change, jamais
    autrement — le cache reste donc pleinement efficace entre deux
    versions.
    """
    with open(chemin, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()[:8]


def decouper(texte, nom):
    """Sépare le bloc d'en-tête (clé: valeur) du contenu de la page."""
    if "\n---\n" not in texte:
        raise SystemExit("%s : il manque la ligne '---' entre l'en-tête "
                         "et le contenu." % nom)
    entete, contenu = texte.split("\n---\n", 1)
    champs = {}
    for ligne in entete.splitlines():
        ligne = ligne.strip()
        if not ligne or ligne.startswith("#"):
            continue
        if ":" not in ligne:
            raise SystemExit("%s : ligne d'en-tête illisible → %r" % (nom, ligne))
        cle, valeur = ligne.split(":", 1)
        champs[cle.strip()] = valeur.strip()
    for obligatoire in ("titre", "description", "fichier"):
        if obligatoire not in champs:
            raise SystemExit("%s : champ '%s' manquant." % (nom, obligatoire))
    return champs, contenu.strip()


def construire():
    gabarit = lire(os.path.join(SOURCE, "gabarit.html"))
    version_css = empreinte(os.path.join(RACINE, "assets/css/site.css"))
    version_js = empreinte(os.path.join(RACINE, "assets/js/site.js"))
    fichiers = sorted(f for f in os.listdir(PAGES) if f.endswith(".html"))
    if not fichiers:
        raise SystemExit("Aucune page trouvée dans %s" % PAGES)

    produits = []
    for nom in fichiers:
        champs, contenu = decouper(lire(os.path.join(PAGES, nom)), nom)
        page = gabarit

        page = page.replace("{{TITRE}}", champs["titre"])
        page = page.replace("{{DESCRIPTION}}", champs["description"])
        # L'adresse canonique de l'accueil est le domaine nu.
        page = page.replace("{{FICHIER}}",
                            "" if champs["fichier"] == "index.html" else champs["fichier"])
        page = page.replace("{{PRECHARGEMENT}}", champs.get("prechargement", ""))
        page = page.replace("{{DONNEES_STRUCTUREES}}", champs.get("donnees", ""))
        page = page.replace("{{CONTENU}}", contenu)
        page = page.replace("{{V_CSS}}", version_css)
        page = page.replace("{{V_JS}}", version_js)

        # Onglet actif. Par défaut, la page elle-même ; le champ
        # « onglet » permet à une sous-page (la FAQ, par exemple) de
        # signaler la rubrique dont elle dépend — sans quoi le visiteur
        # ne verrait plus du tout où il se trouve.
        actuelle = champs.get("onglet", champs["fichier"].replace(".html", ""))
        for onglet in ONGLETS:
            marque = ' aria-current="page"' if onglet == actuelle else ""
            page = page.replace("{{ACTIF_%s}}" % onglet, marque)

        restants = re.findall(r"\{\{[A-Z_a-z-]+\}\}", page)
        if restants:
            raise SystemExit("%s : marqueurs non remplacés → %s"
                             % (nom, ", ".join(sorted(set(restants)))))

        destination = os.path.join(RACINE, champs["fichier"])
        io.open(destination, "w", encoding="utf-8").write(page)
        produits.append((champs["fichier"], len(page)))

    largeur = max(len(f) for f, _ in produits)
    for fichier, taille in produits:
        print("  %-*s  %5d octets" % (largeur, fichier, taille))
    print("\n%d pages construites." % len(produits))
    print("Version des fichiers : style %s · script %s" % (version_css, version_js))


if __name__ == "__main__":
    try:
        construire()
    except SystemExit as erreur:
        print("ERREUR :", erreur, file=sys.stderr)
        raise
