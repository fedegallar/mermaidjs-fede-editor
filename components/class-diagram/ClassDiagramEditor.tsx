"use client";

import { useMemo, useState } from "react";
import {
  DndContext, DragEndEvent, PointerSensor, TouchSensor,
  useSensor, useSensors, closestCenter,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Boxes, Link2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useClassDiagramStore } from "@/lib/class-diagram-store";
import ClassCard from "./ClassCard";
import RelationsPanel from "./RelationsPanel";

const MermaidPreview = dynamic(
  () => import("@/components/shared/MermaidPreview"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Cargando vista previa…
      </div>
    ),
  }
);

type Tab = "classes" | "relations";

export default function ClassDiagramEditor() {
  const { classes, mermaidSyntax, addClass, reorderClasses } = useClassDiagramStore();
  const [tab, setTab] = useState<Tab>("classes");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const sorted = useMemo(
    () => [...classes].sort((a, b) => a.order - b.order),
    [classes]
  );

  const allIds = sorted.map((c) => c.id);

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const fromIdx = allIds.indexOf(active.id as string);
    const toIdx   = allIds.indexOf(over.id as string);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...allIds];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, active.id as string);
    reorderClasses(reordered);
  }

  return (
    <div className="flex flex-col h-full lg:flex-row gap-0">
      {/* Left panel */}
      <div className="flex flex-col w-full lg:w-[440px] lg:min-w-[340px] border-r border-gray-200 bg-gray-50 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setTab("classes")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              tab === "classes"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Boxes size={14} /> Clases
          </button>
          <button
            onClick={() => setTab("relations")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              tab === "relations"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Link2 size={14} /> Relaciones
          </button>
        </div>

        {/* Toolbar */}
        {tab === "classes" && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
            <span className="text-xs text-gray-500">{classes.length} clase{classes.length !== 1 ? "s" : ""}</span>
            <button
              onClick={addClass}
              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              <Plus size={12} /> Agregar clase
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {tab === "classes" ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {sorted.map((cls) => (
                    <ClassCard key={cls.id} cls={cls} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <RelationsPanel />
          )}
        </div>
      </div>

      {/* Right panel — preview */}
      <div className="flex flex-col flex-1 min-h-[300px] lg:min-h-0 overflow-hidden bg-white">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Vista previa</span>
          <span className="text-xs text-gray-400 font-mono">classDiagram</span>
        </div>
        <MermaidPreview syntax={mermaidSyntax} className="flex-1" />
      </div>
    </div>
  );
}
