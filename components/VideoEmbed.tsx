type VideoEmbedProps = {
  /** ID YouTube (la partie après v= ou après youtu.be/) */
  youtube?: string;
  /** ID du fichier Google Drive (voir README pour l'obtenir) */
  drive?: string;
  /** Titre affiché au-dessus de la vidéo */
  title?: string;
};

/**
 * Utilisation dans un cours.mdx :
 *
 *   <VideoEmbed youtube="dQw4w9WgXcQ" title="Introduction aux suites" />
 *   <VideoEmbed drive="1AbCDefGhIjKlmnoPQRstuVWxyz" title="Correction exercice 3" />
 *
 * Voir le README ("Ajouter une vidéo à un chapitre") pour savoir comment
 * récupérer l'ID YouTube ou l'ID Google Drive.
 */
export default function VideoEmbed({ youtube, drive, title }: VideoEmbedProps) {
  const src = youtube
    ? `https://www.youtube.com/embed/${youtube}`
    : drive
      ? `https://drive.google.com/file/d/${drive}/preview`
      : null;

  if (!src) return null;

  return (
    <div className="not-prose my-8 overflow-hidden rounded-lg border border-board/15 bg-board">
      {title && (
        <p className="border-b border-chalk/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-chalk/70">
          {title}
        </p>
      )}
      <div className="relative aspect-video w-full">
        <iframe
          src={src}
          title={title ?? "Vidéo du cours"}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
