"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { MindMapNode, NODE_SHAPES, NodeShape } from "@/lib/types";

interface Props {
  node: MindMapNode;
  onSave: (text: string, shape: NodeShape) => void;
  onCancel: () => void;
}

export default function NodeEditor({ node, onSave, onCancel }: Props) {
  const [text, setText] = useState(node.text);
  const [shape, setShape] = useState<NodeShape>(node.shape);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) onSave(text.trim(), shape);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2 bg-white rounded-lg shadow-lg border border-blue-300 min-w-[200px]">
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Texto del nodo"
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
      />
      <div className="flex flex-wrap gap-1">
        {NODE_SHAPES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setShape(s.value)}
            className={`px-2 py-0.5 text-xs rounded border transition-colors ${
              shape === s.value
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded hover:bg-gray-100 text-gray-500"
        >
          <X size={14} />
        </button>
        <button
          type="submit"
          className="p-1 rounded hover:bg-blue-100 text-blue-600"
        >
          <Check size={14} />
        </button>
      </div>
    </form>
  );
}
