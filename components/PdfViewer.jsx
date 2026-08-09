'use client';
import { useState, useRef, useCallback } from 'react';

export default function PdfViewer({ url, title }) {
  const [height, setHeight] = useState(900);
  const [width, setWidth] = useState(100); // en %
  const containerRef = useRef(null);
  const resizingRef = useRef(null);

  const startResize = useCallback((direction) => (e) => {
    e.preventDefault();
    resizingRef.current = {
      direction,
      startY: e.clientY,
      startX: e.clientX,
      startHeight: height,
      startWidth: width,
      containerWidth: containerRef.current?.offsetWidth || 1000,
    };

    const onMove = (moveEvent) => {
      const r = resizingRef.current;
      if (!r) return;
      if (r.direction === 'height' || r.direction === 'both') {
        const newHeight = r.startHeight + (moveEvent.clientY - r.startY);
        setHeight(Math.max(400, newHeight));
      }
      if (r.direction === 'width' || r.direction === 'both') {
        const deltaPercent = ((moveEvent.clientX - r.startX) / r.containerWidth) * 100;
        const newWidth = r.startWidth + deltaPercent;
        setWidth(Math.min(100, Math.max(30, newWidth)));
      }
    };

    const onUp = () => {
      resizingRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [height, width]);

  return (
    <div ref={containerRef} className="relative w-screen left-1/2 right-1/2 -mx-[50vw] px-4 md:px-8">
      <div
        className="relative mx-auto border rounded-lg overflow-hidden bg-white"
        style={{ width: `${width}%`, height: `${height}px` }}
      >
        <iframe
          src={`${url}#toolbar=1`}
          title={title}
          className="w-full h-full"
        />

        {/* Poignée bas (hauteur) */}
        <div
          onMouseDown={startResize('height')}
          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-board/10 hover:bg-board/30 transition"
          title="Glisser pour ajuster la hauteur"
        />

        {/* Poignée droite (largeur) */}
        <div
          onMouseDown={startResize('width')}
          className="absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize bg-board/10 hover:bg-board/30 transition"
          title="Glisser pour ajuster la largeur"
        />

        {/* Poignée coin (les deux) */}
        <div
          onMouseDown={startResize('both')}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-board/30 hover:bg-board/50"
          title="Glisser pour ajuster hauteur + largeur"
        />
      </div>

      <div className="mx-auto mt-1 text-center" style={{ width: `${width}%` }}>
        <span className="text-[11px] text-ink/40">
          {Math.round(width)}% de largeur · {height}px de hauteur — glisser les bords pour redimensionner
        </span>
      </div>
    </div>
  );
}