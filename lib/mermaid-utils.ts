import { MindMapNode, NodeShape } from "./types";

const INDENT = "  ";
const ROOT_ID = "root";

function shapeWrap(text: string, shape: NodeShape): string {
  switch (shape) {
    case "square":    return `[${text}]`;
    case "rounded":   return `(${text})`;
    case "circle":    return `((${text}))`;
    case "bang":      return `)${text}(`;
    case "cloud":     return `)${text}(`;
    case "hexagon":   return `{{${text}}}`;
    default:          return text;
  }
}

function getChildren(parentId: string | null, nodes: MindMapNode[]): MindMapNode[] {
  return nodes
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => a.order - b.order);
}

function renderNode(
  node: MindMapNode,
  nodes: MindMapNode[],
  depth: number
): string {
  const indent = INDENT.repeat(depth);
  const wrapped = shapeWrap(node.text, node.shape);
  const children = getChildren(node.id, nodes);
  const childLines = children.map((c) => renderNode(c, nodes, depth + 1));
  return [indent + wrapped, ...childLines].join("\n");
}

export function generateMermaidSyntax(nodes: MindMapNode[]): string {
  const root = nodes.find((n) => n.parentId === null);
  if (!root) return "mindmap\n  root";
  const rootLine = INDENT + shapeWrap(root.text, root.shape);
  const children = getChildren(root.id, nodes);
  const childLines = children.map((c) => renderNode(c, nodes, 2));
  return ["mindmap", rootLine, ...childLines].join("\n");
}

// ── Parser ────────────────────────────────────────────────────────────────────

function parseShape(raw: string): { text: string; shape: NodeShape } {
  const t = raw.trim();
  if (/^\(\(.*\)\)$/.test(t)) return { text: t.slice(2, -2), shape: "circle" };
  if (/^\{\{.*\}\}$/.test(t)) return { text: t.slice(2, -2), shape: "hexagon" };
  if (/^\[.*\]$/.test(t))    return { text: t.slice(1, -1), shape: "square" };
  if (/^\(.*\)$/.test(t))    return { text: t.slice(1, -1), shape: "rounded" };
  if (/^\).*\($/.test(t))    return { text: t.slice(1, -1), shape: "bang" };
  return { text: t, shape: "default" };
}

let parseCounter = 0;
const nextId = () => `p_${++parseCounter}_${Date.now()}`;

export function parseMermaidSyntax(syntax: string): MindMapNode[] {
  parseCounter = 0;
  const lines = syntax.split("\n");
  const nodes: MindMapNode[] = [];

  // Stack of { id, depth }
  const stack: { id: string; depth: number }[] = [];

  let isFirst = true;

  for (const rawLine of lines) {
    if (rawLine.trim() === "" || rawLine.trim() === "mindmap") continue;

    const depth = rawLine.search(/\S/);
    const content = rawLine.trim();
    const { text, shape } = parseShape(content);

    // Pop stack until we find the parent
    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    const parentId = stack.length === 0 ? null : stack[stack.length - 1].id;
    const siblings = nodes.filter((n) => n.parentId === parentId);

    const id = isFirst ? ROOT_ID : nextId();
    isFirst = false;

    nodes.push({ id, text, shape, parentId, order: siblings.length });
    stack.push({ id, depth });
  }

  if (nodes.length === 0) {
    return [{ id: ROOT_ID, text: "Root", shape: "circle", parentId: null, order: 0 }];
  }

  return nodes;
}
