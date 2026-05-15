export type Visibility = "+" | "-" | "#" | "~";
export type MemberKind = "attribute" | "method";

export type RelationType =
  | "inheritance"
  | "composition"
  | "aggregation"
  | "association"
  | "dependency"
  | "realization"
  | "link";

export const RELATION_CONFIGS: Record<
  RelationType,
  { arrow: string; label: string; description: string }
> = {
  inheritance:  { arrow: "<|--", label: "Herencia",     description: "B hereda de A" },
  realization:  { arrow: "..|>", label: "Realización",  description: "B implementa A" },
  composition:  { arrow: "*--",  label: "Composición",  description: "A contiene B (fuerte)" },
  aggregation:  { arrow: "o--",  label: "Agregación",   description: "A contiene B (débil)" },
  association:  { arrow: "-->",  label: "Asociación",   description: "A usa B" },
  dependency:   { arrow: "..>",  label: "Dependencia",  description: "A depende de B" },
  link:         { arrow: "--",   label: "Enlace",       description: "Relación simple" },
};

export const ANNOTATIONS = [
  "",
  "<<Interface>>",
  "<<Abstract>>",
  "<<Service>>",
  "<<Enumeration>>",
  "<<Entity>>",
  "<<DTO>>",
];

export const VISIBILITIES: { value: Visibility; label: string; color: string }[] = [
  { value: "+", label: "+ público",    color: "text-green-600" },
  { value: "-", label: "- privado",    color: "text-red-600" },
  { value: "#", label: "# protegido",  color: "text-amber-600" },
  { value: "~", label: "~ paquete",    color: "text-blue-600" },
];

export interface ClassMember {
  id: string;
  kind: MemberKind;
  visibility: Visibility;
  type: string;       // attribute type / method return type
  name: string;
  params: string;     // only for methods
  isStatic: boolean;
  isAbstract: boolean;
}

export interface ClassNode {
  id: string;
  name: string;
  annotation: string;
  members: ClassMember[];
  order: number;
}

export interface ClassRelation {
  id: string;
  fromId: string;
  toId: string;
  type: RelationType;
  fromLabel: string;  // cardinality on from side
  toLabel: string;    // cardinality on to side
  label: string;      // relationship label
}

export interface ClassDiagramState {
  classes: ClassNode[];
  relations: ClassRelation[];
}
