import { create } from "zustand";
import { MindMapNode, NodeShape } from "./types";
import { generateMermaidSyntax, parseMermaidSyntax } from "./mermaid-utils";

let idCounter = 100;
const genId = () => `node_${++idCounter}_${Date.now()}`;

interface MindMapStore {
  nodes: MindMapNode[];
  selectedNodeId: string | null;
  mermaidSyntax: string;

  setSelectedNode: (id: string | null) => void;
  addNode: (parentId: string | null) => void;
  updateNode: (id: string, text: string, shape: NodeShape) => void;
  deleteNode: (id: string) => void;
  moveNode: (id: string, newParentId: string | null, newOrder: number) => void;
  reorderSiblings: (parentId: string | null, orderedIds: string[]) => void;
  importFromSyntax: (syntax: string) => void;
  refreshSyntax: () => void;
}

const ROOT_ID = "root";

const defaultNodes: MindMapNode[] = [
  { id: ROOT_ID, text: "Mi Mindmap", shape: "circle", parentId: null, order: 0 },
  { id: "node_1", text: "Tema 1", shape: "rounded", parentId: ROOT_ID, order: 0 },
  { id: "node_2", text: "Subtema 1.1", shape: "default", parentId: "node_1", order: 0 },
  { id: "node_3", text: "Subtema 1.2", shape: "default", parentId: "node_1", order: 1 },
  { id: "node_4", text: "Tema 2", shape: "rounded", parentId: ROOT_ID, order: 1 },
  { id: "node_5", text: "Subtema 2.1", shape: "default", parentId: "node_4", order: 0 },
];

export const useMindMapStore = create<MindMapStore>((set, get) => ({
  nodes: defaultNodes,
  selectedNodeId: null,
  mermaidSyntax: generateMermaidSyntax(defaultNodes),

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  addNode: (parentId) => {
    const nodes = get().nodes;
    const siblings = nodes.filter((n) => n.parentId === parentId);
    const newNode: MindMapNode = {
      id: genId(),
      text: "Nuevo nodo",
      shape: "default",
      parentId,
      order: siblings.length,
    };
    const updated = [...nodes, newNode];
    set({
      nodes: updated,
      selectedNodeId: newNode.id,
      mermaidSyntax: generateMermaidSyntax(updated),
    });
  },

  updateNode: (id, text, shape) => {
    const updated = get().nodes.map((n) =>
      n.id === id ? { ...n, text, shape } : n
    );
    set({ nodes: updated, mermaidSyntax: generateMermaidSyntax(updated) });
  },

  deleteNode: (id) => {
    if (id === ROOT_ID) return;
    const getAllDescendants = (nodeId: string, allNodes: MindMapNode[]): string[] => {
      const children = allNodes.filter((n) => n.parentId === nodeId);
      return [nodeId, ...children.flatMap((c) => getAllDescendants(c.id, allNodes))];
    };
    const toDelete = new Set(getAllDescendants(id, get().nodes));
    const updated = get().nodes.filter((n) => !toDelete.has(n.id));
    set({
      nodes: updated,
      selectedNodeId: null,
      mermaidSyntax: generateMermaidSyntax(updated),
    });
  },

  moveNode: (id, newParentId, newOrder) => {
    if (id === ROOT_ID || id === newParentId) return;
    // Prevent moving into own descendant
    const isDescendant = (checkId: string, nodes: MindMapNode[]): boolean => {
      if (checkId === id) return true;
      const parent = nodes.find((n) => n.id === checkId);
      if (!parent || !parent.parentId) return false;
      return isDescendant(parent.parentId, nodes);
    };
    if (newParentId && isDescendant(newParentId, get().nodes)) return;

    const updated = get().nodes.map((n) =>
      n.id === id ? { ...n, parentId: newParentId, order: newOrder } : n
    );
    set({ nodes: updated, mermaidSyntax: generateMermaidSyntax(updated) });
  },

  reorderSiblings: (parentId, orderedIds) => {
    const updated = get().nodes.map((n) => {
      const idx = orderedIds.indexOf(n.id);
      return idx !== -1 ? { ...n, order: idx } : n;
    });
    set({ nodes: updated, mermaidSyntax: generateMermaidSyntax(updated) });
  },

  importFromSyntax: (syntax) => {
    const nodes = parseMermaidSyntax(syntax);
    set({ nodes, mermaidSyntax: generateMermaidSyntax(nodes), selectedNodeId: null });
  },

  refreshSyntax: () => {
    set({ mermaidSyntax: generateMermaidSyntax(get().nodes) });
  },
}));
