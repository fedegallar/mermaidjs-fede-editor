"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, ChevronDown, ChevronRight, Code, Database } from "lucide-react";
import { ClassNode, ANNOTATIONS, VISIBILITIES, Visibility, MemberKind } from "@/lib/class-diagram-types";
import { useClassDiagramStore } from "@/lib/class-diagram-store";
import MemberRow from "./MemberRow";

interface Props {
  cls: ClassNode;
}

export default function ClassCard({ cls }: Props) {
  const {
    selectedClassId, setSelectedClass,
    updateClass, deleteClass,
    addMember,
  } = useClassDiagramStore();

  const [expanded, setExpanded] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(cls.name);

  const isSelected = selectedClassId === cls.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cls.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const attributes_ = cls.members.filter((m) => m.kind === "attribute");
  const methods_     = cls.members.filter((m) => m.kind === "method");

  function commitName() {
    if (nameVal.trim()) updateClass(cls.id, { name: nameVal.trim() });
    else setNameVal(cls.name);
    setEditingName(false);
  }

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <div
        className={`rounded-xl border-2 bg-white shadow-sm transition-all ${
          isSelected ? "border-blue-400 shadow-blue-100 shadow-md" : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => setSelectedClass(isSelected ? null : cls.id)}
      >
        {/* Header */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-t-xl border-b border-gray-200">
          {/* Drag handle */}
          <button
            className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </button>

          {/* Collapse */}
          <button
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Name */}
          {editingName ? (
            <input
              autoFocus
              value={nameVal}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => { if (e.key === "Enter") commitName(); if (e.key === "Escape") { setNameVal(cls.name); setEditingName(false); } }}
              className="flex-1 min-w-0 text-sm font-semibold px-1 border-b border-blue-400 focus:outline-none bg-transparent"
            />
          ) : (
            <span
              className="flex-1 min-w-0 text-sm font-semibold text-gray-800 truncate cursor-text"
              onDoubleClick={(e) => { e.stopPropagation(); setEditingName(true); setNameVal(cls.name); }}
            >
              {cls.name}
            </span>
          )}

          {/* Annotation badge */}
          {cls.annotation && (
            <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
              {cls.annotation}
            </span>
          )}

          {/* Delete */}
          <button
            className="text-gray-300 hover:text-red-500 flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); deleteClass(cls.id); }}
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Body */}
        {expanded && (
          <div className="px-3 py-2 space-y-1" onClick={(e) => e.stopPropagation()}>
            {/* Annotation selector */}
            {isSelected && (
              <select
                value={cls.annotation}
                onChange={(e) => updateClass(cls.id, { annotation: e.target.value })}
                className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400 text-purple-700"
              >
                {ANNOTATIONS.map((a) => (
                  <option key={a} value={a}>{a || "Sin anotación"}</option>
                ))}
              </select>
            )}

            {/* Attributes */}
            {attributes_.length > 0 && (
              <div className="border-b border-dashed border-gray-100 pb-1 mb-1">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1 flex items-center gap-1">
                  <Database size={9} /> Atributos
                </p>
                {attributes_.map((m) => (
                  <MemberRow key={m.id} classId={cls.id} member={m} visible={isSelected} />
                ))}
              </div>
            )}

            {/* Methods */}
            {methods_.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1 flex items-center gap-1">
                  <Code size={9} /> Métodos
                </p>
                {methods_.map((m) => (
                  <MemberRow key={m.id} classId={cls.id} member={m} visible={isSelected} />
                ))}
              </div>
            )}

            {/* Add buttons */}
            {isSelected && (
              <div className="flex gap-1.5 pt-2 border-t border-dashed border-gray-100 mt-2">
                <button
                  onClick={() => addMember(cls.id, "attribute")}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
                >
                  <Plus size={10} /> Atributo
                </button>
                <button
                  onClick={() => addMember(cls.id, "method")}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-md transition-colors"
                >
                  <Plus size={10} /> Método
                </button>
              </div>
            )}

            {cls.members.length === 0 && !isSelected && (
              <p className="text-xs text-gray-300 italic py-1">Sin miembros</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
