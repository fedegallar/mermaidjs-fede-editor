"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  syntax: string;
  className?: string;
}

let mermaidInstance: typeof import("mermaid").default | null = null;

export default function MermaidPreview({ syntax, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const renderIdRef = useRef(0);

  useEffect(() => {
    const renderId = ++renderIdRef.current;

    async function render() {
      if (!containerRef.current) return;
      try {
        if (!mermaidInstance) {
          const mod = await import("mermaid");
          mermaidInstance = mod.default;
          mermaidInstance.initialize({
            startOnLoad: false,
            theme: "default",
            mindmap: { padding: 16 },
          });
        }

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaidInstance.render(id, syntax);

        if (renderId !== renderIdRef.current) return;
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (renderId !== renderIdRef.current) return;
        setError(e instanceof Error ? e.message : "Error al renderizar");
      }
    }

    render();
  }, [syntax]);

  return (
    <div className={`relative w-full h-full overflow-auto ${className}`}>
      {error ? (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 m-4">
          <strong>Error de sintaxis:</strong>
          <pre className="mt-1 whitespace-pre-wrap text-xs">{error}</pre>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex items-center justify-center min-h-full p-4 [&_svg]:max-w-full [&_svg]:h-auto"
        />
      )}
    </div>
  );
}
