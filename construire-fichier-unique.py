#!/usr/bin/env python3
"""
Fabrique une version du site en UN SEUL FICHIER HTML, à envoyer par mail,
AirDrop ou WeTransfer. La personne qui le reçoit double-clique dessus : la
page s'ouvre dans Safari ou Chrome, sans rien installer et sans serveur.

Tout est embarqué dans le fichier : styles, animations et captures d'écran.
La seule ressource extérieure est la police (Google Fonts) ; sans connexion,
la page bascule proprement sur la police du système.

Usage :   python3 construire-fichier-unique.py
Résultat: ~/Desktop/Aumely_Prototype.html
"""

import base64
import io
import os
import re
from PIL import Image

# Les captures sont affichées au maximum sur 380 px de large. 820 px couvre
# donc largement les écrans retina (2×), tout en divisant le poids du fichier.
# Le redimensionnement est STRICTEMENT proportionnel : aucun recadrage, aucune
# retouche, le contenu des captures n'est jamais modifié.
LARGEUR_IMAGE = 820
LARGEUR_ICONE = 256

SITE = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.expanduser("~/Desktop/Aumely_Prototype.html")


def image_embarquee(chemin, largeur):
    """Renvoie l'image en data: URI, redimensionnée proportionnellement."""
    im = Image.open(chemin)
    if im.width > largeur:
        hauteur = round(im.height * largeur / im.width)
        im = im.resize((largeur, hauteur), Image.LANCZOS)
    tampon = io.BytesIO()
    im.save(tampon, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(tampon.getvalue()).decode()


def construire():
    html = open(os.path.join(SITE, "index.html"), encoding="utf-8").read()
    css = open(os.path.join(SITE, "assets/css/style.css"), encoding="utf-8").read()
    js = open(os.path.join(SITE, "assets/js/main.js"), encoding="utf-8").read()

    # 1. Retirer les variantes WebP : dans un fichier autonome, il n'y a
    #    plus de serveur pour les livrer, et une balise <source> l'emporte
    #    sur l'image de repli — la capture ne s'afficherait pas du tout.
    html = re.sub(r'\s*<source srcset="assets/[^"]+\.webp"[^>]*>', "", html)
    html = re.sub(r'\s*<link rel="preload"[^>]*\.webp"[^>]*>', "", html)

    # 2. Embarquer les images
    for src in sorted(set(re.findall(r'src="(assets/(?:img|icon)/[^"]+\.png)"', html))):
        largeur = LARGEUR_ICONE if "icon" in src else LARGEUR_IMAGE
        uri = image_embarquee(os.path.join(SITE, src), largeur)
        html = html.replace('src="%s"' % src, 'src="%s"' % uri)

    # 3. Embarquer la feuille de style
    html = html.replace(
        '<link rel="stylesheet" href="assets/css/style.css">',
        "<style>\n%s\n</style>" % css,
    )

    # 4. Embarquer le script
    html = html.replace(
        '<script src="assets/js/main.js" defer></script>',
        "<script>\n%s\n</script>" % js,
    )

    # 5. Retirer les icônes de raccourci, qui pointaient vers des fichiers
    #    devenus absents une fois le fichier déplacé.
    html = re.sub(r'\s*<link rel="(?:apple-touch-)?icon"[^>]*>', "", html)
    html = re.sub(r'\s*<meta property="og:image[^"]*"[^>]*>', "", html)
    html = re.sub(r'\s*<meta name="twitter:image"[^>]*>', "", html)

    with open(SORTIE, "w", encoding="utf-8") as f:
        f.write(html)

    poids = os.path.getsize(SORTIE) / 1024 / 1024
    print("Fichier créé : %s" % SORTIE)
    print("Poids        : %.1f Mo" % poids)
    if "assets/" in html:
        print("ATTENTION : il reste des renvois vers assets/ — le fichier "
              "ne serait pas autonome.")
    else:
        print("Autonome    : aucune référence à un fichier extérieur.")


if __name__ == "__main__":
    construire()
