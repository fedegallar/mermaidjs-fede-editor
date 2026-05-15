"use client";

import { useState } from "react";
import { FileDown, Menu, X } from "lucide-react";
import { DiagramType, DIAGRAM_TYPES } from "@/lib/types";
import DiagramTypeSelector from "@/components/shared/DiagramTypeSelector";
import ImportExportModal from "@/components/shared/ImportExportModal";
import MindMapEditor from "@/components/mindmap/MindMapEditor";
import ClassDiagramEditor from "@/components/class-diagram/ClassDiagramEditor";
import { useMindMapStore } from "@/lib/store";
import { useClassDiagramStore } from "@/lib/class-diagram-store";

function useActiveStore(activeDiagram: DiagramType) {
  const mindmap = useMindMapStore();
  const classDiagram = useClassDiagramStore();

  if (activeDiagram === "mindmap") {
    return {
      syntax: mindmap.mermaidSyntax,
      onImport: mindmap.importFromSyntax,
      syntaxKeyword: "mindmap",
    };
  }
  return {
    syntax: classDiagram.mermaidSyntax,
    onImport: classDiagram.importFromSyntax,
    syntaxKeyword: "classDiagram",
  };
}

export default function Home() {
  const [activeDiagram, setActiveDiagram] = useState<DiagramType>("mindmap");
  const [showImportExport, setShowImportExport] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { syntax, onImport, syntaxKeyword } = useActiveStore(activeDiagram);
  const diagramLabel =
    DIAGRAM_TYPES.find((d) => d.id === activeDiagram)?.label ?? activeDiagram;

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="text-base font-bold text-gray-800 tracking-tight">
            🧩 Mermaid Editor
          </span>
          <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {diagramLabel}
          </span>
        </div>
        <button
          onClick={() => setShowImportExport(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <FileDown size={14} />
          <span className="hidden sm:inline">Importar / Exportar</span>
          <span className="sm:hidden">I/E</span>
        </button>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            lg:relative lg:flex lg:translate-x-0
            fixed z-40 inset-y-0 left-0 transition-transform duration-200
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="h-full overflow-y-auto bg-white shadow-lg lg:shadow-none border-r border-gray-200">
            <DiagramTypeSelector
              active={activeDiagram}
              onChange={(t) => {
                setActiveDiagram(t);
                setSidebarOpen(false);
              }}
            />
          </div>
        </aside>

        {/* Main editor */}
        <main className="flex-1 min-w-0 overflow-hidden">
          {activeDiagram === "mindmap"      && <MindMapEditor />}
          {activeDiagram === "classDiagram" && <ClassDiagramEditor />}
        </main>
      </div>

      {showImportExport && (
        <ImportExportModal
          syntax={syntax}
          onImport={onImport}
          diagramLabel={diagramLabel}
          syntaxKeyword={syntaxKeyword}
          onClose={() => setShowImportExport(false)}
        />
      )}
    </div>
  );
}
