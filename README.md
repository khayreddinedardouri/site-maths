# Site de maths — 1ère & Terminale

Frontend Next.js sans base de données : tout le contenu (cours, QCM, PDF) vit
dans des fichiers versionnés avec Git.

## Lancer le projet en local

```bash
npm install
npm run dev
```

Ouvrez http://localhost:3000

## Ajouter un examen dédié (avec code d'accès individuel)

Structure attendue :
```
public/examens-prives/{code}/mon-examen.pdf
public/examens-prives/{code}/meta.json   (optionnel)
```

1. Choisissez un code unique, plutôt long et peu devinable, par exemple
   `LEA-2026-9F3K` (évitez `eleve1`, `test`, etc.)
2. Créez le dossier `public/examens-prives/{code}/` et déposez le PDF dedans.
3. (Optionnel) Ajoutez un `meta.json` pour personnaliser l'accueil :
   ```json
   { "eleve": "Léa" }
   ```
4. `git add . && git commit -m "Examen dédié Léa" && git push`
5. Donnez le code à l'élève. Il le saisit sur `/prive` et accède directement
   à son PDF.

**Important — ce n'est pas une vraie sécurité.** Le code fonctionne comme un lien
secret : n'importe qui connaissant le code (ou le devinant, ou le trouvant dans
l'historique Git si le dépôt est public) peut accéder au fichier. C'est suffisant
pour éviter qu'un élève tombe sur l'examen d'un autre par hasard, mais ne l'utilisez
pas pour des documents réellement confidentiels. Si le dépôt GitHub est public,
préférez le passer en privé (`Settings → General → Danger Zone → Change visibility`)
pour que les codes/fichiers ne soient pas visibles sur GitHub.

## Ajouter un examen (classé par niveau et par chapitre, avec recherche)

Structure attendue :
```
public/examens/{niveau}/{chapitre}/mon-examen.pdf
```
où `{niveau}` est `1ere`, `terminale` ou `superieur`.

1. Renommez votre PDF avec un nom clair, par exemple :
   `Bac-blanc-Mars-2026.pdf`
2. Déposez-le dans le bon dossier, par exemple :
   `public/examens/terminale/suites-limites-suites/Bac-blanc-Mars-2026.pdf`
   (pour Terminale et 1ère, utilisez les mêmes noms de dossiers que dans `content/`
   afin que l'examen tombe dans le bon chapitre — la liste est dans `content/{niveau}/`)
3. Pour **Supérieur**, les dossiers de chapitres sont libres : créez-en un nouveau
   si besoin (`public/examens/superieur/probabilites/` par exemple).
4. `git add . && git commit -m "Ajout examen" && git push`

L'examen apparaît automatiquement sur `/examens/{niveau}`, rangé sous son chapitre.
La barre de recherche filtre en tapant le nom de l'examen **ou** le nom du chapitre.

## Ajouter un chapitre

1. Créez un dossier dans `content/{1ere|terminale}/mon-chapitre/`
2. Ajoutez un fichier `cours.mdx` :

```mdx
---
titre: "Titre du chapitre"
ordre: 3
---

Votre contenu en markdown ici.
```

3. (Optionnel) Ajoutez un `qcm.json` sur le même modèle que les exemples fournis.
4. (Optionnel) Ajoutez des PDF d'exercices ou de TD **directement dans**
   `content/{niveau}/mon-chapitre/`, à côté de `cours.mdx`. Ils sont copiés
   automatiquement vers `public/content/{niveau}/mon-chapitre/` (voir section
   suivante) et apparaissent alors dans la section "Documents" de la page.
5. `git add . && git commit -m "Ajout chapitre" && git push` — Vercel redéploie seul.

## Ajouter un TD / une fiche d'exercices à un chapitre existant

Déposez simplement le PDF **dans le dossier du chapitre**, à côté de son `cours.mdx` :

```
content/{niveau}/mon-chapitre/mon-td.pdf
```

Un script (`scripts/sync-content-docs.mjs`) le copie automatiquement vers
`public/content/{niveau}/mon-chapitre/` — c'est cet endroit que Next.js sert
réellement et que la page de chapitre lit pour afficher la liste des
"Documents". Ce script tourne tout seul :

- avant `npm run dev` (en local) ;
- avant `npm run build` (donc aussi au déploiement sur Vercel).

Vous pouvez aussi le lancer à la main à tout moment avec :

```bash
npm run sync-docs
```

Il ne fait que **copier** (jamais supprimer) et ignore les fichiers déjà à
jour, donc il est sans risque de le relancer plusieurs fois. Après avoir
déposé le PDF, pensez simplement à :

```bash
git add . && git commit -m "Ajout TD" && git push
```

## Écrire des formules en LaTeX dans un cours

Les fichiers `cours.mdx` supportent LaTeX via `remark-math` + `rehype-katex` :

- Formule **en ligne** : `$f(x) = x^2$` → rendu comme une formule mathématique.
- Formule **centrée** : `$$\lim_{n \to +\infty} u_n = \ell$$`

Après avoir récupéré une mise à jour qui touche aux dépendances, pensez à relancer
`npm install` (trois paquets : `remark-math`, `rehype-katex`, `katex`).

> Ces trois paquets étaient déjà installés mais n'étaient pas réellement branchés
> sur le rendu MDX (le CSS de KaTeX n'était pas importé, et les plugins
> `remark-math`/`rehype-katex` n'étaient pas passés à `MDXRemote`) : les `$...$`
> s'affichaient donc comme du texte brut au lieu de formules. C'est corrigé dans
> `app/[niveau]/[chapitre]/page.tsx` et `app/layout.tsx`. Tous les chapitres de
> Suites ont aussi été réécrits avec la vraie syntaxe LaTeX (`$u_n$`, `$$...$$`)
> à la place de l'ancienne notation avec des backticks (`` `u(n)` ``).

## Ajouter une vidéo à un chapitre (YouTube ou Google Drive)

Un composant `<VideoEmbed />` est disponible directement dans les fichiers `cours.mdx`.

### Vidéo YouTube

1. Ouvrez votre vidéo YouTube, copiez son URL, par exemple :
   `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. L'ID est la partie après `v=` : ici `dQw4w9WgXcQ`.
3. Dans votre `cours.mdx`, ajoutez :
   ```mdx
   <VideoEmbed youtube="dQw4w9WgXcQ" title="Introduction aux suites" />
   ```

### Vidéo personnelle stockée sur Google Drive

1. Déposez votre vidéo sur Google Drive.
2. Clic droit → **Partager** → réglez l'accès sur **"Tous les utilisateurs disposant du
   lien"** (sinon la vidéo ne s'affichera pas pour vos élèves).
3. Copiez le lien de partage, qui ressemble à :
   `https://drive.google.com/file/d/1AbCDefGhIjKlmnoPQRstuVWxyz/view?usp=sharing`
4. L'ID est la longue chaîne entre `/d/` et `/view` : ici `1AbCDefGhIjKlmnoPQRstuVWxyz`.
5. Dans votre `cours.mdx`, ajoutez :
   ```mdx
   <VideoEmbed drive="1AbCDefGhIjKlmnoPQRstuVWxyz" title="Correction de l'exercice 3" />
   ```

Vous pouvez placer autant de balises `<VideoEmbed />` que vous voulez, où vous voulez
dans le cours (par exemple juste après la partie qu'elle illustre).

## Le traceur interactif (`/outils/traceur`)

Un outil de traçage interactif est accessible depuis le menu ("Traceur") et lié en bas
de chaque page de chapitre. Il propose deux modes :

- **Tracer une fonction f(x)** : utile pour tous les chapitres d'étude de fonctions
  (second degré, exponentielle, logarithme, trigonométrie...).
- **Étudier une suite uₙ₊₁ = f(uₙ)** : affiche la suite ET le diagramme "en toile
  d'araignée" (courbe de f, droite y = x, trajectoire de la suite), l'outil visuel
  standard pour comprendre la convergence vers un point fixe (chapitres Suites et
  Continuité).

Expressions supportées : `+ - * / ^`, parenthèses, `sin cos tan asin acos atan sqrt abs
exp ln log`, constantes `pi` et `e`. La variable est `x` en mode fonction, `u` en mode
suite (représentant $u_n$ dans $f(u_n)$).

## Feedback des QCM (optionnel, sans base de données)

Pour recevoir les scores des élèves dans un Google Sheet :

1. Créez un Google Form avec les champs `chapitre`, `score`, `total`, `date`.
2. Liez-le à un Google Sheet.
3. Récupérez l'URL de soumission du formulaire.
4. Créez un fichier `.env.local` à la racine :

```
NEXT_PUBLIC_FEEDBACK_FORM_URL=https://docs.google.com/forms/d/e/VOTRE_ID/formResponse
```

Le bouton "Envoyer mon score au professeur" apparaîtra automatiquement sur les QCM.

## Déploiement

1. Poussez le projet sur GitHub.
2. Sur [vercel.com](https://vercel.com), "Import Project" → sélectionnez le repo.
3. Ajoutez la variable d'environnement `NEXT_PUBLIC_FEEDBACK_FORM_URL` si utilisée.
4. Déployez.

## Ajouter un jeu de fin de chapitre (10 questions, à la place du QCM)

Chaque chapitre peut avoir un **jeu** de 10 questions avec 3 vies (❤️❤️❤️), à la place
de l'ancien QCM classique. Dès qu'un fichier `jeu.json` existe dans le dossier du
chapitre, il remplace automatiquement le QCM sur la page — pas besoin de toucher au
code, ni pour ce chapitre ni pour les autres (les chapitres sans `jeu.json` gardent
le QCM normalement).

**1. Créez le fichier** `content/{niveau}/mon-chapitre/jeu.json`

**2. Remplissez exactement 10 questions**, en piochant parmi 4 types :

- **`qcm`** — question à choix multiples classique
```json
  {
    "type": "qcm",
    "id": "q1",
    "question": "Quelle est la dérivée de la fonction exponentielle ?",
    "choix": ["x·e^(x-1)", "e^x", "0", "e^(x-1)"],
    "reponse": 1,
    "explication": "C'est LA propriété fondamentale : (eˣ)' = eˣ."
  }
```
  `reponse` est l'**index** (à partir de 0) du bon choix dans `choix`.

- **`vrai_faux`** — affirmation vraie ou fausse
```json
  {
    "type": "vrai_faux",
    "id": "q2",
    "question": "Pour tout réel x, e^x > 0.",
    "reponse": true,
    "explication": "L'exponentielle est toujours strictement positive, jamais nulle."
  }
```

- **`calcul`** — l'élève tape sa réponse dans un champ texte
```json
  {
    "type": "calcul",
    "id": "q3",
    "question": "Calcule e⁰.",
    "reponsesAcceptees": ["1"],
    "placeholder": "e⁰ = ...",
    "explication": "Par définition, f(0) = 1."
  }
```
  `reponsesAcceptees` est une **liste** : mettez toutes les formes possibles pour ne
  pas pénaliser un élève pour une virgule au lieu d'un point (ex. `["1/2", "0.5", "0,5"]`).
  La comparaison ignore les espaces, la casse, et accepte `,` comme `.`.

- **`clic_courbe`** — l'élève clique sur la bonne courbe parmi 4 mini-graphiques
```json
  {
    "type": "clic_courbe",
    "id": "q7",
    "question": "Clique sur la courbe représentative de y = eˣ.",
    "courbes": ["exp-croissante", "exp-decroissante", "parabole", "droite-croissante"],
    "reponse": "exp-croissante",
    "explication": "La courbe de eˣ est croissante, passe par (0;1) et (1;e)..."
  }
```
  Les courbes disponibles (déjà dessinées dans le composant, rien à créer) :
  `exp-croissante`, `exp-decroissante`, `droite-croissante`, `parabole`,
  `log-croissante`, `constante`.

**3. Structure globale du fichier** :
```json
{
  "chapitre": "Fonction exponentielle",
  "titre": "Le jeu de l'exponentielle",
  "questions": [ /* vos 10 questions ici, dans n'importe quel ordre de types */ ]
}
```

**4. Envoyez** : `git add . && git commit -m "Jeu chapitre exponentielle" && git push`

Le jeu apparaît directement sur `/{niveau}/mon-chapitre`, à l'endroit où était le QCM.
Mécanique : 3 vies, une erreur en retire une, à 0 vie c'est terminé (bouton Rejouer) ;
en répondant aux 10 questions sans épuiser ses vies, l'élève voit son score final.

> 💡 Le plus simple pour un nouveau chapitre : copiez `content/terminale/expo/jeu.json`
> comme modèle, et adaptez les 10 questions au contenu du nouveau chapitre.



## Prochaines étapes de contenu (feuille de route)

Cette mise à jour pose l'infrastructure (LaTeX, vidéos, traceur, build corrigé) et livre
un premier chapitre entièrement retravaillé (*Suites et limites de suites*, en 4 parties :
arithmético-géométriques, limites/convergence, récurrence, suites définies par une
fonction). Le reste du programme de Terminale reste à restructurer chapitre par chapitre,
notamment :

- **Étude de fonctions**, à éclater en plusieurs chapitres dédiés : second degré, premier
  degré, polynômes, exponentielle, logarithme, dérivation, primitives, équations
  différentielles, tracé de courbes (avec un rappel de 1ère à chaque fois).
- **Probabilités** : probabilités conditionnelles, formule des probabilités totales,
  arbres pondérés, loi binomiale, loi uniforme, épreuve de Bernoulli, formule de Bayes.
- **Trigonométrie** : angles (radians/degrés), fonctions sin/cos, périodicité, parité,
  tracé des courbes.

Ce sont des chapitres volumineux qui méritent chacun le même niveau de détail que celui
livré pour les suites : la meilleure approche est de les traiter un par un, avec un QCM
dédié à la fin de chaque chapitre non vide.
