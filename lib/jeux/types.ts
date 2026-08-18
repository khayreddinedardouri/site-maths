export type CourbeKey =
  | "exp-croissante"
  | "exp-decroissante"
  | "droite-croissante"
  | "parabole"
  | "log-croissante"
  | "constante";

export type JeuQuestionQcm = {
  type: "qcm";
  id: string;
  question: string;
  choix: string[];
  reponse: number;
  explication: string;
};

export type JeuQuestionVraiFaux = {
  type: "vrai_faux";
  id: string;
  question: string;
  reponse: boolean;
  explication: string;
};

export type JeuQuestionCalcul = {
  type: "calcul";
  id: string;
  question: string;
  reponsesAcceptees: string[];
  explication: string;
  placeholder?: string;
};

export type JeuQuestionClicCourbe = {
  type: "clic_courbe";
  id: string;
  question: string;
  courbes: CourbeKey[];
  reponse: CourbeKey;
  explication: string;
};

export type JeuQuestion =
  | JeuQuestionQcm
  | JeuQuestionVraiFaux
  | JeuQuestionCalcul
  | JeuQuestionClicCourbe;

export type Jeu = {
  chapitre: string;
  titre: string;
  questions: JeuQuestion[];
};