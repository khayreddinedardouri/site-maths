"use client";

import { useEffect, useMemo, useState } from "react";

type StudentAccount = {
  id: string;
  name: string;
  login: string;
  phone: string;
  createdAt: string;
};

type SharedItem = {
  id: string;
  studentLogin: string;
  studentName: string;
  title: string;
  code: string;
  message: string;
  phone?: string;
  createdAt: string;
};

type ViewMode = "teacher" | "student";

const STORAGE_KEY_ITEMS = "maths-shared-items-v3";
const STORAGE_KEY_STUDENTS = "maths-students-v1";

const emptyStudentForm = {
  name: "",
  login: "",
  phone: "",
};

const emptyShareForm = {
  studentLogin: "",
  title: "",
  code: "",
  message: "",
};

function normalizePhone(value: string) {
  const raw = value.replace(/[^\d+]/g, "").trim();

  if (!raw) {
    return "";
  }

  if (raw.startsWith("+")) {
    return raw;
  }

  const digits = raw.replace(/\D/g, "");

  if (digits.startsWith("33") && digits.length === 11) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `+33${digits.slice(1)}`;
  }

  return `+${digits}`;
}

function buildSmsText(item: SharedItem) {
  const base = `Bonjour ${item.studentName || item.studentLogin}, ton intervenant a partagé un examen ou un TD sur l’espace maths.`;
  const body = item.message ? `\n\nMessage : ${item.message}` : "";
  const code = `\n\nCode / accès : ${item.code}`;
  const titre = `\nTitre : ${item.title}`;

  return `${base}${titre}${code}${body}`;
}

export default function CommunicationPanel() {
  const [items, setItems] = useState<SharedItem[]>([]);
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [studentForm, setStudentForm] = useState(emptyStudentForm);
  const [shareForm, setShareForm] = useState(emptyShareForm);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("teacher");
  const [studentLogin, setStudentLogin] = useState("");
  const [status, setStatus] = useState<string>("");

  const knownStudents = useMemo(
    () => [...students].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [students]
  );

  const selectedStudent = useMemo(
    () => students.find((student) => student.login.toLowerCase() === shareForm.studentLogin.trim().toLowerCase()) || null,
    [students, shareForm.studentLogin]
  );

  const studentItems = useMemo(() => {
    const normalized = studentLogin.trim().toLowerCase();
    if (!normalized) return [];

    return items
      .filter((item) => item.studentLogin.trim().toLowerCase() === normalized)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [items, studentLogin]);

  useEffect(() => {
    try {
      const rawItems = window.localStorage.getItem(STORAGE_KEY_ITEMS);
      const rawStudents = window.localStorage.getItem(STORAGE_KEY_STUDENTS);

      if (rawItems) {
        setItems(JSON.parse(rawItems) as SharedItem[]);
      }

      if (rawStudents) {
        setStudents(JSON.parse(rawStudents) as StudentAccount[]);
      }
    } catch {
      setItems([]);
      setStudents([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
      window.localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch {
      // Ignore storage failures.
    }
  }, [items, students, loaded]);

  function ajouterEtudiant() {
    const name = studentForm.name.trim();
    const login = studentForm.login.trim();
    const phone = normalizePhone(studentForm.phone);

    if (!name || !login || !phone) {
      setStatus("Complète le nom, le login et le numéro de l’élève.");
      return;
    }

    const existing = students.some((student) => student.login.toLowerCase() === login.toLowerCase());
    if (existing) {
      setStatus("Ce login existe déjà. Choisis un autre login.");
      return;
    }

    const nouveau: StudentAccount = {
      id: crypto.randomUUID(),
      name,
      login,
      phone,
      createdAt: new Date().toISOString(),
    };

    setStudents((prev) => [nouveau, ...prev]);
    setStudentForm(emptyStudentForm);
    setShareForm((prev) => ({ ...prev, studentLogin: login }));
    setStatus(`Login élève créé pour ${name}.`);
  }

  function ajouterPartage() {
    const studentLoginValue = shareForm.studentLogin.trim();
    const title = shareForm.title.trim();
    const code = shareForm.code.trim();
    const message = shareForm.message.trim();

    if (!studentLoginValue || !title || !code) {
      setStatus("Choisis l’élève, le titre et le code avant d’enregistrer.");
      return;
    }

    const account = students.find(
      (student) => student.login.toLowerCase() === studentLoginValue.toLowerCase()
    );

    if (!account) {
      setStatus("Ce login n’existe pas encore. Crée d’abord le compte de l’élève.");
      return;
    }

    const nouveau: SharedItem = {
      id: crypto.randomUUID(),
      studentLogin: account.login,
      studentName: account.name,
      title,
      code,
      message,
      phone: account.phone,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [nouveau, ...prev]);
    setShareForm((prev) => ({ ...prev, title: "", code: "", message: "" }));
    setStatus(`Partage enregistré pour ${account.name}.`);
  }

  async function copier(item: SharedItem) {
    const contenu = buildSmsText(item);

    try {
      await navigator.clipboard.writeText(contenu);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 1200);
      setStatus("Message prêt à être envoyé et copié.");
    } catch {
      setStatus("Copie impossible, mais le message est prêt à être recopié.");
    }
  }

  function ouvrirNotification(item: SharedItem) {
    if (!item.phone) {
      setStatus("Aucun numéro enregistré pour cet élève.");
      return;
    }

    const text = buildSmsText(item);
    const phoneNumber = normalizePhone(item.phone);

    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\+/g, "")}?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setStatus(`Notification WhatsApp préparée pour ${item.studentName || item.studentLogin}.`);
  }

  function supprimer(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function supprimerEtudiant(id: string) {
    setStudents((prev) => prev.filter((student) => student.id !== id));
    setItems((prev) => prev.filter((item) => item.studentLogin !== (students.find((student) => student.id === id)?.login || "")));
  }

  return (
    <div className="rounded-3xl border border-fuchsia-200 bg-white/80 p-6 shadow-sm backdrop-blur-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-500">Comm ELEV</p>
          <h2 className="mt-2 font-display text-2xl text-ink">Comm ELEV</h2>
        </div>

        <div className="inline-flex rounded-full border border-fuchsia-200 bg-fuchsia-50 p-1">
          <button
            type="button"
            onClick={() => setViewMode("teacher")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              viewMode === "teacher" ? "bg-fuchsia-500 text-white shadow-sm" : "text-fuchsia-700"
            }`}
          >
            Professeur
          </button>
          <button
            type="button"
            onClick={() => setViewMode("student")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              viewMode === "student" ? "bg-sky-500 text-white shadow-sm" : "text-sky-700"
            }`}
          >
            Élève
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-ink/70">
        Ici tu peux créer un login élève avec son numéro, partager un code ou un examen, puis notifier directement cet élève.
      </p>

      {status && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {status}
        </div>
      )}

      {viewMode === "teacher" ? (
        <>
          <div className="mt-6 grid gap-4 rounded-2xl border border-dashed border-fuchsia-200 bg-fuchsia-50/60 p-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-fuchsia-100 bg-white p-4">
              <h3 className="font-display text-xl text-ink">Créer un login élève</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-ink/70">
                  Nom
                  <input
                    value={studentForm.name}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex. Celia"
                    className="rounded-lg border border-fuchsia-200 bg-white px-3 py-2 text-sm"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-ink/70">
                  Login
                  <input
                    value={studentForm.login}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, login: e.target.value }))}
                    placeholder="Ex. celia"
                    className="rounded-lg border border-fuchsia-200 bg-white px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="mt-3 block text-sm text-ink/70">
                Numéro de téléphone
                <input
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ex. 06 12 34 56 78"
                  className="mt-1 w-full rounded-lg border border-fuchsia-200 bg-white px-3 py-2 text-sm"
                />
              </label>

              <button
                type="button"
                onClick={ajouterEtudiant}
                className="mt-4 w-full rounded-lg bg-gradient-to-r from-fuchsia-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
              >
                Créer le login élève
              </button>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-white p-4">
              <h3 className="font-display text-xl text-ink">Partager un code / un examen</h3>

              <label className="mt-4 block text-sm text-ink/70">
                Élève
                <select
                  value={shareForm.studentLogin}
                  onChange={(e) => setShareForm((prev) => ({ ...prev, studentLogin: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Choisir un élève</option>
                  {knownStudents.map((student) => (
                    <option key={student.id} value={student.login}>
                      {student.name} ({student.login})
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-ink/70">
                  Titre
                  <input
                    value={shareForm.title}
                    onChange={(e) => setShareForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex. Examen blanc"
                    className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-ink/70">
                  Code / accès
                  <input
                    value={shareForm.code}
                    onChange={(e) => setShareForm((prev) => ({ ...prev, code: e.target.value }))}
                    placeholder="Ex. EXAMEN_2026"
                    className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="mt-3 block text-sm text-ink/70">
                Message pour l’élève
                <textarea
                  value={shareForm.message}
                  onChange={(e) => setShareForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Ex. Voici l’examen à ouvrir sur l’espace..."
                  className="mt-1 min-h-[90px] w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm"
                />
              </label>

              <button
                type="button"
                onClick={ajouterPartage}
                className="mt-4 w-full rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
              >
                Enregistrer le partage
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
            <p className="text-sm font-semibold text-sky-700">Élèves enregistrés</p>

            {knownStudents.length === 0 ? (
              <p className="mt-2 text-sm text-ink/70">Aucun élève enregistré pour l’instant.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {knownStudents.map((student) => (
                  <div key={student.id} className="flex flex-col gap-3 rounded-xl border border-sky-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-ink">{student.name}</p>
                      <p className="text-xs text-ink/60">Login : {student.login}</p>
                      <p className="text-xs text-ink/60">Téléphone : {student.phone}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => supprimerEtudiant(student.id)}
                      className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-600"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-fuchsia-200 bg-fuchsia-50/50 p-6 text-sm text-ink/70">
                Aucun message partagé pour l’instant.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-sky-600">
                        {new Date(item.createdAt).toLocaleDateString("fr-FR")} · {item.studentName} ({item.studentLogin})
                      </p>
                      <h3 className="mt-1 font-display text-lg text-ink">{item.title}</h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => copier(item)}
                        className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700"
                      >
                        {copiedId === item.id ? "Copié" : "Préparer le message"}
                      </button>
                      <button
                        type="button"
                        onClick={() => ouvrirNotification(item)}
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                      >
                        Notifier WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => supprimer(item.id)}
                        className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-600"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl bg-white p-3 text-sm text-ink/80">
                    <span className="font-semibold">Code / accès :</span> {item.code}
                  </div>

                  {item.message && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-ink/70">{item.message}</p>
                  )}

                  {item.phone && (
                    <p className="mt-3 text-xs text-ink/60">Notification SMS prévue sur : {item.phone}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
          <label className="flex flex-col gap-1 text-sm text-ink/70">
            Ton login élève
            <input
              value={studentLogin}
              onChange={(e) => setStudentLogin(e.target.value)}
              placeholder="Ex. celia"
              className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
            />
          </label>

          <p className="mt-3 text-xs text-ink/60">
            Le mode élève affiche uniquement les partages liés à ce login. Si un numéro est enregistré, le message peut être envoyé sur téléphone.
          </p>

          {studentLogin.trim() ? (
            <div className="mt-5 space-y-4">
              {studentItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-sky-200 bg-white/50 p-6 text-sm text-ink/70">
                  Aucun message pour ce login pour l’instant.
                </div>
              ) : (
                studentItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-sky-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-widest text-sky-600">
                      {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                    <h3 className="mt-1 font-display text-xl text-ink">{item.title}</h3>

                    <div className="mt-3 rounded-xl bg-sky-50 p-3 text-sm text-ink/80">
                      <span className="font-semibold">Code / accès :</span> {item.code}
                    </div>

                    {item.message && (
                      <p className="mt-3 whitespace-pre-wrap text-sm text-ink/70">{item.message}</p>
                    )}

                    {item.phone ? (
                      <p className="mt-3 text-xs text-ink/60">Notification prévue sur ce numéro : {item.phone}</p>
                    ) : (
                      <p className="mt-3 text-xs text-ink/60">Aucun numéro enregistré pour ce message.</p>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
