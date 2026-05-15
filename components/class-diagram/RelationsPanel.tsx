"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { RelationType, RELATION_CONFIGS } from "@/lib/class-diagram-types";
import { useClassDiagramStore } from "@/lib/class-diagram-store";

export default function RelationsPanel() {
  const { classes, relations, addRelation, updateRelation, deleteRelation } = useClassDiagramStore();

  const [fromId, setFromId] = useState("");
  const [toId,   setToId]   = useState("");
  const [type,   setType]   = useState<RelationType>("association");
  const [label,  setLabel]  = useState("");
  const [fromLabel, setFromLabel] = useState("");
  const [toLabel,   setToLabel]   = useState("");
  const [error, setError] = useState("");

  function handleAdd() {
    if (!fromId || !toId) { setError("Seleccioná origen y destino."); return; }
    if (fromId === toId)  { setError("Origen y destino no pueden ser iguales."); return; }
    addRelation({ fromId, toId, type, label, fromLabel, toLabel });
    setLabel(""); setFromLabel(""); setToLabel(""); setError("");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Add form */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
        <p className="text-xs font-semibold text-gray-600">Nueva relación</p>

        {/* From / To */}
        <div className="flex items-center gap-1.5">
          <select
            value={fromId}
            onChange={(e) => { setFromId(e.target.value); setError(""); }}
            className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">Origen…</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />

          <select
            value={toId}
            onChange={(e) => { setToId(e.target.value); setError(""); }}
            className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">Destino…</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Relation type */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value as RelationType)}
          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          {(Object.entries(RELATION_CONFIGS) as [RelationType, typeof RELATION_CONFIGS[RelationType]][]).map(
            ([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label} ({cfg.arrow}) — {cfg.description}
              </option>
            )
          )}
        </select>

        {/* Cardinality + label */}
        <div className="flex gap-1.5">
          <input
            value={fromLabel}
            onChange={(e) => setFromLabel(e.target.value)}
            placeholder='Cardinalidad "1"'
            className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <input
            value={toLabel}
            onChange={(e) => setToLabel(e.target.value)}
            placeholder='"many"'
            className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Etiqueta opcional"
          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus size={12} /> Agregar relación
        </button>
      </div>

      {/* Relations list */}
      {relations.length === 0 ? (
        <p className="text-xs text-gray-400 italic text-center py-4">Sin relaciones aún</p>
      ) : (
        <div className="space-y-2">
          {relations.map((rel) => {
            const from = classes.find((c) => c.id === rel.fromId);
            const to   = classes.find((c) => c.id === rel.toId);
            if (!from || !to) return null;
            const cfg = RELATION_CONFIGS[rel.type];
            return (
              <div key={rel.id} className="flex items-start gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-xs text-gray-700 font-medium flex-wrap">
                    <span className="text-blue-700">{from.name}</span>
                    {rel.fromLabel && <span className="text-gray-400 font-mono">"{rel.fromLabel}"</span>}
                    <span className="font-mono text-gray-500">{cfg.arrow}</span>
                    {rel.toLabel && <span className="text-gray-400 font-mono">"{rel.toLabel}"</span>}
                    <span className="text-blue-700">{to.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{cfg.label}</span>
                    {rel.label && <span className="text-[10px] text-gray-500">"{rel.label}"</span>}
                  </div>
                </div>
                <button
                  onClick={() => deleteRelation(rel.id)}
                  className="text-gray-300 hover:text-red-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
