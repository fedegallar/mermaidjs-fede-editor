export type NodeShape =
  | "default"
  | "square"
  | "rounded"
  | "circle"
  | "bang"
  | "cloud"
  | "hexagon";

export interface MindMapNode {
  id: string;
  text: string;
  shape: NodeShape;
  parentId: string | null;
  order: number;
}

export type DiagramType = "mindmap" | "classDiagram";

export interface DiagramTypeConfig {
  id: DiagramType;
  label: string;
  description: string;
  icon: string;
}

export const DIAGRAM_TYPES: DiagramTypeConfig[] = [
  {
    id: "mindmap",
    label: "Mindmap",
    description: "Mapa mental jerárquico",
    icon: "🧠",
  },
  {
    id: "classDiagram",
    label: "Clases",
    description: "Diagrama de clases UML",
    icon: "🗂️",
  },
];

export const NODE_SHAPES: { value: NodeShape; label: string; example: string }[] = [
  { value: "default", label: "Default", example: "texto" },
  { value: "square", label: "Cuadrado", example: "[texto]" },
  { value: "rounded", label: "Redondeado", example: "(texto)" },
  { value: "circle", label: "Círculo", example: "((texto))" },
  { value: "bang", label: "Explosión", example: ")texto(" },
  { value: "cloud", label: "Nube", example: ")texto(" },
  { value: "hexagon", label: "Hexágono", example: "{{texto}}" },
];
