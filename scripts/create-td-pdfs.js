const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd());

const chapters = [
  {
    folder: 'equations-inequations',
    file: 'TD_equations_inequations.pdf',
    title: 'TD - Equations et inequations',
    lines: [
      '1. Resoudre 5x - 15 = 0',
      '2. Resoudre (x - 3)(x + 2) = 0',
      '3. Resoudre 3x + 6 < 0',
      '4. Resoudre (x - 1)(x - 5) >= 0',
      '5. Etudier le signe de f(x) = (x - 2)(x + 1)',
      '6. Resoudre graphiquement (x - 2)(x - 4) <= 0',
      '7. Conclusion : analyser le signe et lire les intersections',
    ],
  },
  {
    folder: 'equations-second-degre',
    file: 'TD_equations_second_degre.pdf',
    title: 'TD - Equations du second degre',
    lines: [
      '1. Resoudre x^2 - 7x + 10 = 0',
      '2. Resoudre (x - 1)(x + 4) = 0',
      '3. Une parabole coupe l axe en x = 1 et x = 5',
      '4. Ecrire la forme factorisee puis la forme developpee',
      '5. Etudier le signe de f(x) = x^2 - 4x + 3',
      '6. Cas particulier : 4x^2 - 12x + 9 = 0',
      '7. Lire les solutions sur le graphique',
    ],
  },
  {
    folder: 'fonctions',
    file: 'TD_fonctions.pdf',
    title: 'TD - Fonctions',
    lines: [
      '1. Determiner le domaine de definition de f(x) = 1/(x - 2)',
      '2. Etudier f(x) = 3x - 5',
      '3. Calculer f(0), f(1), f(-2)',
      '4. Etudier f(x) = x^2 - 6x + 8',
      '5. Trouver les racines et le sommet',
      '6. Resoudre 2x + 7 = 0',
      '7. Resoudre x^2 - 5x + 6 <= 0',
      '8. Lire graphiquement les intersections avec l axe des abscisses',
    ],
  },
  {
    folder: 'fonctions-second-degre',
    file: 'TD_fonctions_second_degre.pdf',
    title: 'TD - Fonctions du second degre',
    lines: [
      '1. Identifier a, b et c dans f(x) = 2x^2 - 8x + 6',
      '2. Calculer l abscisse du sommet',
      '3. Determiner si la parabole est ouverte vers le haut',
      '4. Resoudre x^2 - 5x + 6 = 0',
      '5. Etudier le signe de f(x) = x^2 - 4x + 3',
      '6. Une parabole coupe l axe en x = 1 et x = 3',
      '7. Ecrire la forme factorisee puis la forme developpee',
      '8. Resoudre graphiquement x^2 - 2x - 3 = 0',
    ],
  },
  {
    folder: 'suites-numeriques',
    file: 'TD_suites_numeriques.pdf',
    title: 'TD - Suites numeriques',
    lines: [
      '1. Calculer u0, u1, u2 pour u_n = 3n + 2',
      '2. Etudier la suite recurrente u0 = 4, u_{n+1} = u_n + 5',
      '3. Suite arithmetique de raison 3 et u0 = 2',
      '4. Ecrire u_n puis calculer u_4',
      '5. Suite geometrique de raison 2 et v0 = 5',
      '6. Calculer v3',
      '7. Etudier le sens de variation de u_n = 5 - 2n',
      '8. Dans une suite geometrique, premier terme 3 et raison 4',
    ],
  },
  {
    folder: 'trigonometrie-1',
    file: 'TD_trigonometrie_1.pdf',
    title: 'TD - Trigonometrie I',
    lines: [
      '1. Dans un triangle rectangle, on sait sin(theta) = 3/5',
      '2. Calculer cos(theta) puis tan(theta)',
      '3. Evaluer sin(pi/4), cos(pi/3), tan(pi/6)',
      '4. Un arbre a 12 m de distance et un angle de pi/6',
      '5. Calculer la hauteur h',
      '6. Un triangle rectangle a une hypotenuese de 10 et un angle pi/3',
      '7. Calculer le cote adjacent puis le cote oppose',
      '8. Choisir la bonne formule selon les donnees connus',
    ],
  },
  {
    folder: 'trigonometrie-2',
    file: 'TD_trigonometrie_2.pdf',
    title: 'TD - Trigonometrie II',
    lines: [
      '1. Determiner la periode de sin(x), cos(x), tan(x)',
      '2. Dire si les fonctions x^2, x^3, sin(x), cos(x) sont paires ou impaires',
      '3. Quelle condition donne une symetrie par rapport a l axe des ordonnees ?',
      '4. Quelle condition donne une symetrie par rapport a l origine ?',
      '5. Resoudre sin x = sqrt(2)/2',
      '6. Resoudre graphiquement cos x >= 0',
      '7. Identifier un exemple de fonction periodique, paire et bornee',
      '8. Expliquer pourquoi tan(x) ne convient pas a cet exemple',
    ],
  },
  {
    folder: 'probabilites-conditionnelles',
    file: 'TD_probabilites_conditionnelles.pdf',
    title: 'TD - Probabilites conditionnelles',
    lines: [
      '1. 40% des eleves jouent au football et 25% jouent au football et au basket',
      '2. Calculer P(basket | football)',
      '3. On lance un de equilibre : A = pair, B = > 3',
      '4. Calculer P(A), P(B), P(A inter B)',
      '5. Dire si A et B sont independants',
      '6. Calculer la probabilité de tirer un cœur puis un carreau',
      '7. Utiliser la formule des probabilites totales',
      '8. Interpreted un test medical positif',
    ],
  },
  {
    folder: 'variables-aleatoires',
    file: 'TD_variables_aleatoires.pdf',
    title: 'TD - Variables aleatoires',
    lines: [
      '1. On lance un de et on note X',
      '2. Donner les valeurs possibles de X',
      '3. Donner la loi de probabilite de X',
      '4. Calculer E(X)',
      '5. Calculer E(X^2) puis V(X)',
      '6. Soit Y prenant 1, 2, 3 avec proba 0.2, 0.5, 0.3',
      '7. Calculer E(Y)',
      '8. Expliquer la difference entre moyenne et dispersion',
    ],
  },
  {
    folder: 'algorithmique',
    file: 'TD_algorithmique.pdf',
    title: 'TD - Algorithmique',
    lines: [
      '1. Ecrire un algorithme qui affiche le double de x',
      '2. Ecrire un algorithme avec test sur x',
      '3. Afficher les entiers de 1 a 10',
      '4. Calculer 1 + 2 + ... + 10',
      '5. Expliquer le programme x <- 3 ; x <- x + 2 ; x <- x * 4',
      '6. Si x < 5 alors afficher petit sinon grand',
      '7. Tester sur x = 4 puis x = 7',
      '8. Verifier chaque etape du programme',
    ],
  },
];

function escapePdfText(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildPdf(title, lines) {
  const contentLines = [
    `BT /F1 16 Tf 50 800 Td (${escapePdfText(title)}) Tj ET`,
  ];

  let y = 770;
  for (const line of lines) {
    contentLines.push(`BT /F1 12 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`);
    y -= 18;
  }

  const content = contentLines.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, 'binary');
}

for (const chapter of chapters) {
  const folder = path.join(root, 'public', 'content', '1ere', chapter.folder);
  fs.mkdirSync(folder, { recursive: true });
  const filePath = path.join(folder, chapter.file);
  const pdf = buildPdf(chapter.title, chapter.lines);
  fs.writeFileSync(filePath, pdf);
  console.log(`Created ${filePath}`);
}
