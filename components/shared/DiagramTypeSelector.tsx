"use client";

import { DIAGRAM_TYPES, DiagramType } from "@/lib/types";

interface Props {
  active: DiagramType;
  onChange: (type: DiagramType) => void;
}

export default function DiagramTypeSelector({ active, onChange }: Props) {
  return (
    <nav className="flex flex-row lg:flex-col gap-1 p-2 bg-white overflow-x-auto lg:overflow-visible lg:w-[180px] lg:min-w-[180px]">
      <p className="hidden lg:block text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
        Diagramas
      </p>
      {DIAGRAM_TYPES.map((dt) => (
        <button
          key={dt.id}
          onClick={() => onChange(dt.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            active === dt.id
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span>{dt.icon}</span>
          <span>{dt.label}</span>
        </button>
      ))}

      <div className="hidden lg:flex flex-col gap-1 mt-2 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 px-2">Próximamente</p>
        {["Flowchart", "Sequence", "Gantt", "ER Diagram"].map((label) => (
          <button
            key={label}
            disabled
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 cursor-not-allowed"
          >
            <span>⬜</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
