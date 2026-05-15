"use client";

import { useState } from "react";
import { Trash2, Check, X } from "lucide-react";
import { ClassMember, VISIBILITIES, Visibility } from "@/lib/class-diagram-types";
import { useClassDiagramStore } from "@/lib/class-diagram-store";

interface Props {
  classId: string;
  member: ClassMember;
  visible: boolean; // show edit controls only when parent class is selected
}

const VIS_COLORS: Record<Visibility, string> = {
  "+": "text-green-600",
  "-": "text-red-500",
  "#": "text-amber-500",
  "~": "text-blue-500",
};

export default function MemberRow({ classId, member, visible }: Props) {
  const { updateMember, deleteMember } = useClassDiagramStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(member);

  function commit() {
    updateMember(classId, member.id, draft);
    setEditing(false);
  }

  function cancel() {
    setDraft(member);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="bg-gray-50 border border-blue-200 rounded-lg p-2 mb-1 space-y-1.5 text-xs">
        <div className="flex gap-1">
          <select
            value={draft.visibility}
            onChange={(e) => setDraft({ ...draft, visibility: e.target.value as Visibility })}
            className="border border-gray-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 w-24"
          >
            {VISIBILITIES.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
          <input
            className="flex-1 min-w-0 border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            placeholder={member.kind === "attribute" ? "Tipo" : "Tipo retorno"}
            value={draft.type}
            onChange={(e) => setDraft({ ...draft, type: e.target.value })}
          />
        </div>
        <div className="flex gap-1">
          <input
            className="flex-1 min-w-0 border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            placeholder="Nombre"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
            autoFocus
          />
          {member.kind === "method" && (
            <input
              className="flex-1 min-w-0 border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Parámetros"
              value={draft.params}
              onChange={(e) => setDraft({ ...draft, params: e.target.value })}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.isStatic}
              onChange={(e) => setDraft({ ...draft, isStatic: e.target.checked })}
              className="rounded"
            />
            Static
          </label>
          {member.kind === "method" && (
            <label className="flex items-center gap-1 text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.isAbstract}
                onChange={(e) => setDraft({ ...draft, isAbstract: e.target.checked })}
                className="rounded"
              />
              Abstracto
            </label>
          )}
          <div className="flex gap-1 ml-auto">
            <button onClick={cancel}  className="p-0.5 hover:bg-gray-200 rounded text-gray-500"><X size={12} /></button>
            <button onClick={commit}  className="p-0.5 hover:bg-blue-100 rounded text-blue-600"><Check size={12} /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 group py-0.5 cursor-pointer hover:bg-gray-50 rounded px-1"
      onDoubleClick={() => visible && setEditing(true)}
    >
      <span className={`font-mono text-xs font-bold flex-shrink-0 ${VIS_COLORS[member.visibility]}`}>
        {member.visibility}
      </span>
      <span className="text-xs text-gray-500 flex-shrink-0">{member.type}</span>
      <span className="text-xs text-gray-800 truncate">
        {member.kind === "method" ? `${member.name}(${member.params})` : member.name}
        {member.isStatic ? <sup className="ml-0.5 text-gray-400">S</sup> : null}
        {member.isAbstract ? <sup className="ml-0.5 italic text-gray-400">A</sup> : null}
      </span>
      {visible && (
        <div className="ml-auto flex gap-0.5 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => setEditing(true)}
            className="text-[10px] px-1 text-blue-500 hover:bg-blue-50 rounded"
          >
            editar
          </button>
          <button
            onClick={() => deleteMember(classId, member.id)}
            className="text-gray-300 hover:text-red-500"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}
    </div>
  );
}
