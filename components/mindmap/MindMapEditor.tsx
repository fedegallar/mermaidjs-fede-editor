"use client";

import { useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useMindMapStore } from "@/lib/store";
import MindMapTreeNode from "./MindMapTreeNode";
import dynamic from "next/dynamic";

const MermaidPreview = dynamic(
  () => import("@/components/shared/MermaidPreview"),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-gray-400 text-sm">Cargando vista previa…</div> }
);

export default function MindMapEditor() {
  const { nodes, mermaidSyntax, addNode, reorderSiblings } = useMindMapStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const rootNode = nodes.find((n) => n.parentId === null);

  const allIds = useMemo(() => nodes.map((n) => n.id), [nodes]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeNode = nodes.find((n) => n.id === active.id);
    const overNode = nodes.find((n) => n.id === over.id);
    if (!activeNode || !overNode) return;

    // Only reorder within the same parent
    if (activeNode.parentId === overNode.parentId) {
      const siblings = nodes
        .filter((n) => n.parentId === activeNode.parentId)
        .sort((a, b) => a.order - b.order)
        .map((n) => n.id);

      const fromIdx = siblings.indexOf(active.id as string);
      const toIdx = siblings.indexOf(over.id as string);
      if (fromIdx === -1 || toIdx === -1) return;

      const reordered = [...siblings];
      reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, active.id as string);
      reorderSiblings(activeNode.parentId, reordered);
    }
  }

  return (
    <div className="flex flex-col h-full lg:flex-row gap-0">
      {/* Tree editor panel */}
      <div className="flex flex-col w-full lg:w-[420px] lg:min-w-[320px] border-r border-gray-200 bg-gray-50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <span className="text-sm font-semibold text-gray-700">Estructura del Mindmap</span>
          <button
            onClick={() => addNode(rootNode?.id ?? null)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            <Plus size={12} />
            Agregar nodo
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
              {rootNode && (
                <MindMapTreeNode
                  node={rootNode}
                  allNodes={nodes}
                  depth={0}
                  isRoot
                />
              )}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Preview panel */}
      <div className="flex flex-col flex-1 min-h-[300px] lg:min-h-0 overflow-hidden bg-white">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Vista previa</span>
          <span className="text-xs text-gray-400 font-mono">mermaid</span>
        </div>
        <MermaidPreview syntax={mermaidSyntax} className="flex-1" />
      </div>
    </div>
  );
}
