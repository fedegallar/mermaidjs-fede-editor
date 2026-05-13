"use client";

import { useState, useRef } from "react";
import { X, Upload, Download, Copy, Check } from "lucide-react";
import { useMindMapStore } from "@/lib/store";

interface Props {
  onClose: () => void;
}

export default function ImportExportModal({ onClose }: Props) {
  const { mermaidSyntax, importFromSyntax } = useMindMapStore();
  const [tab, setTab] = useState<"export" | "import">("export");
  const [importText, setImportText] = useState("");
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mermaidSyntax);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([mermaidSyntax], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.mmd";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const text = importText.trim();
    if (!text) {
      setImportError("Pega o carga el contenido Mermaid.");
      return;
    }
    if (!text.startsWith("mindmap")) {
      setImportError("Solo se soporta sintaxis mindmap por ahora.");
      return;
    }
    importFromSyntax(text);
    onClose();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImportText((ev.target?.result as string) ?? "");
      setImportError("");
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Importar / Exportar</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {(["export", "import"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "export" ? "Exportar" : "Importar"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5">
          {tab === "export" ? (
            <div className="flex flex-col gap-3">
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono overflow-auto max-h-64 text-gray-700 whitespace-pre">
                {mermaidSyntax}
              </pre>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-1 justify-center"
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex-1 justify-center"
                >
                  <Download size={14} />
                  Descargar .mmd
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-sm border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg text-gray-500 hover:text-blue-600 transition-colors justify-center"
              >
                <Upload size={14} />
                Cargar archivo .mmd
              </button>
              <input ref={fileRef} type="file" accept=".mmd,.txt" className="hidden" onChange={handleFile} />
              <textarea
                value={importText}
                onChange={(e) => { setImportText(e.target.value); setImportError(""); }}
                placeholder="Pega aquí tu sintaxis Mermaid…&#10;&#10;mindmap&#10;  root((Mi mapa))&#10;    Tema 1&#10;      Subtema"
                className="w-full h-48 p-3 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {importError && (
                <p className="text-xs text-red-600">{importError}</p>
              )}
              <button
                onClick={handleImport}
                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Importar diagrama
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
