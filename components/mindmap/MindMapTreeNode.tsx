"use client";

import { useState } from "react";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { MindMapNode, NodeShape } from "@/lib/types";
import { useMindMapStore } from "@/lib/store";
import NodeEditor from "./NodeEditor";

const SHAPE_CLASSES: Record<NodeShape, string> = {
  default:  "rounded",
  square:   "rounded-none",
  rounded:  "rounded-lg",
  circle:   "rounded-full",
  bang:     "rounded",
  cloud:    "rounded-[40%]",
  hexagon:  "rounded",
};

const DEPTH_COLORS = [
  "bg-violet-100 border-violet-300 text-violet-900",
  "bg-blue-100 border-blue-300 text-blue-900",
  "bg-emerald-100 border-emerald-300 text-emerald-900",
  "bg-amber-100 border-amber-300 text-amber-900",
  "bg-rose-100 border-rose-300 text-rose-900",
];

interface Props {
  node: MindMapNode;
  allNodes: MindMapNode[];
  depth: number;
  isRoot?: boolean;
}

export default function MindMapTreeNode({ node, allNodes, depth, isRoot }: Props) {
  const { selectedNodeId, setSelectedNode, updateNode, deleteNode, addNode } =
    useMindMapStore();
  const [editing, setEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const children = allNodes
    .filter((n) => n.parentId === node.id)
    .sort((a, b) => a.order - b.order);

  const isSelected = selectedNodeId === node.id;
  const colorClass = DEPTH_COLORS[depth % DEPTH_COLORS.length];
  const shapeClass = SHAPE_CLASSES[node.shape];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id, data: { parentId: node.parentId, depth } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleSave = (text: string, shape: NodeShape) => {
    updateNode(node.id, text, shape);
    setEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="select-none">
      <div className="flex items-center group gap-1 py-0.5">
        {/* Indent spacer */}
        {depth > 0 && (
          <div
            className="flex-shrink-0"
            style={{ width: depth * 20 }}
          />
        )}

        {/* Collapse toggle */}
        <button
          className={`flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 ${
            children.length === 0 ? "invisible" : ""
          }`}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </button>

        {/* Drag handle */}
        {!isRoot && (
          <button
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={12} />
          </button>
        )}

        {/* Node pill */}
        {editing ? (
          <NodeEditor
            node={node}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <button
            className={`flex-1 min-w-0 px-3 py-1.5 text-sm font-medium border-2 text-left truncate transition-all ${colorClass} ${shapeClass} ${
              isSelected ? "ring-2 ring-blue-400 ring-offset-1" : "hover:brightness-95"
            }`}
            onClick={() => setSelectedNode(isSelected ? null : node.id)}
            onDoubleClick={() => setEditing(true)}
          >
            {node.text}
          </button>
        )}

        {/* Action buttons - always visible on touch, hover on desktop */}
        <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 sm:opacity-0 max-sm:opacity-100">
          <button
            title="Agregar hijo"
            onClick={() => addNode(node.id)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-green-100 text-green-600"
          >
            <Plus size={12} />
          </button>
          <button
            title="Editar"
            onClick={() => setEditing(true)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-100 text-blue-600"
          >
            <Pencil size={12} />
          </button>
          {!isRoot && (
            <button
              title="Eliminar"
              onClick={() => deleteNode(node.id)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-100 text-red-600"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {!collapsed && children.length > 0 && (
        <div>
          {children.map((child) => (
            <MindMapTreeNode
              key={child.id}
              node={child}
              allNodes={allNodes}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
