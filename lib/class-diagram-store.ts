import { create } from "zustand";
import {
  ClassDiagramState,
  ClassMember,
  ClassNode,
  ClassRelation,
  MemberKind,
  RelationType,
  Visibility,
} from "./class-diagram-types";
import {
  generateClassDiagramSyntax,
  parseClassDiagramSyntax,
} from "./class-diagram-utils";

let _seq = 200;
const uid = () => `cd_${++_seq}_${Date.now()}`;

const defaultMember = (kind: MemberKind): ClassMember => ({
  id: uid(),
  kind,
  visibility: kind === "attribute" ? "-" : "+",
  type: kind === "attribute" ? "String" : "void",
  name: kind === "attribute" ? "atributo" : "metodo",
  params: "",
  isStatic: false,
  isAbstract: false,
});

const defaultState: ClassDiagramState = {
  classes: [
    {
      id: "cls_1", name: "Animal", annotation: "<<Abstract>>", order: 0,
      members: [
        { id: "m1", kind: "attribute", visibility: "-", type: "String", name: "nombre", params: "", isStatic: false, isAbstract: false },
        { id: "m2", kind: "attribute", visibility: "-", type: "int",    name: "edad",   params: "", isStatic: false, isAbstract: false },
        { id: "m3", kind: "method",    visibility: "+", type: "void",   name: "hacerSonido", params: "", isStatic: false, isAbstract: true },
        { id: "m4", kind: "method",    visibility: "+", type: "String", name: "getNombre",   params: "", isStatic: false, isAbstract: false },
      ],
    },
    {
      id: "cls_2", name: "Perro", annotation: "", order: 1,
      members: [
        { id: "m5", kind: "attribute", visibility: "-", type: "String", name: "raza",  params: "", isStatic: false, isAbstract: false },
        { id: "m6", kind: "method",    visibility: "+", type: "void",   name: "traer", params: "String objeto", isStatic: false, isAbstract: false },
        { id: "m7", kind: "method",    visibility: "+", type: "void",   name: "hacerSonido", params: "", isStatic: false, isAbstract: false },
      ],
    },
    {
      id: "cls_3", name: "Gato", annotation: "", order: 2,
      members: [
        { id: "m8", kind: "attribute", visibility: "-", type: "boolean", name: "esIndoor", params: "", isStatic: false, isAbstract: false },
        { id: "m9", kind: "method",    visibility: "+", type: "void",    name: "hacerSonido", params: "", isStatic: false, isAbstract: false },
      ],
    },
  ],
  relations: [
    { id: "r1", fromId: "cls_1", toId: "cls_2", type: "inheritance", fromLabel: "", toLabel: "", label: "" },
    { id: "r2", fromId: "cls_1", toId: "cls_3", type: "inheritance", fromLabel: "", toLabel: "", label: "" },
  ],
};

interface ClassDiagramStore extends ClassDiagramState {
  mermaidSyntax: string;
  selectedClassId: string | null;

  // Class CRUD
  setSelectedClass: (id: string | null) => void;
  addClass: () => void;
  updateClass: (id: string, patch: Partial<Pick<ClassNode, "name" | "annotation">>) => void;
  deleteClass: (id: string) => void;
  reorderClasses: (orderedIds: string[]) => void;

  // Member CRUD
  addMember: (classId: string, kind: MemberKind) => void;
  updateMember: (classId: string, memberId: string, patch: Partial<ClassMember>) => void;
  deleteMember: (classId: string, memberId: string) => void;
  reorderMembers: (classId: string, orderedIds: string[]) => void;

  // Relation CRUD
  addRelation: (rel: Omit<ClassRelation, "id">) => void;
  updateRelation: (id: string, patch: Partial<Omit<ClassRelation, "id">>) => void;
  deleteRelation: (id: string) => void;

  // Import / Export
  importFromSyntax: (syntax: string) => void;
}

function sync(state: ClassDiagramState): string {
  return generateClassDiagramSyntax(state);
}

export const useClassDiagramStore = create<ClassDiagramStore>((set, get) => ({
  ...defaultState,
  mermaidSyntax: sync(defaultState),
  selectedClassId: null,

  setSelectedClass: (id) => set({ selectedClassId: id }),

  addClass: () => {
    const cls: ClassNode = {
      id: uid(), name: `Clase${get().classes.length + 1}`,
      annotation: "", members: [], order: get().classes.length,
    };
    const classes = [...get().classes, cls];
    set({ classes, mermaidSyntax: sync({ classes, relations: get().relations }), selectedClassId: cls.id });
  },

  updateClass: (id, patch) => {
    const classes = get().classes.map((c) => c.id === id ? { ...c, ...patch } : c);
    set({ classes, mermaidSyntax: sync({ classes, relations: get().relations }) });
  },

  deleteClass: (id) => {
    const classes  = get().classes.filter((c) => c.id !== id);
    const relations = get().relations.filter((r) => r.fromId !== id && r.toId !== id);
    set({ classes, relations, selectedClassId: null, mermaidSyntax: sync({ classes, relations }) });
  },

  reorderClasses: (orderedIds) => {
    const classes = get().classes.map((c) => ({ ...c, order: orderedIds.indexOf(c.id) }));
    set({ classes, mermaidSyntax: sync({ classes, relations: get().relations }) });
  },

  addMember: (classId, kind) => {
    const member = defaultMember(kind);
    const classes = get().classes.map((c) =>
      c.id === classId ? { ...c, members: [...c.members, member] } : c
    );
    set({ classes, mermaidSyntax: sync({ classes, relations: get().relations }) });
  },

  updateMember: (classId, memberId, patch) => {
    const classes = get().classes.map((c) =>
      c.id === classId
        ? { ...c, members: c.members.map((m) => m.id === memberId ? { ...m, ...patch } : m) }
        : c
    );
    set({ classes, mermaidSyntax: sync({ classes, relations: get().relations }) });
  },

  deleteMember: (classId, memberId) => {
    const classes = get().classes.map((c) =>
      c.id === classId ? { ...c, members: c.members.filter((m) => m.id !== memberId) } : c
    );
    set({ classes, mermaidSyntax: sync({ classes, relations: get().relations }) });
  },

  reorderMembers: (classId, orderedIds) => {
    const classes = get().classes.map((c) =>
      c.id === classId
        ? { ...c, members: orderedIds.map((id) => c.members.find((m) => m.id === id)!).filter(Boolean) }
        : c
    );
    set({ classes, mermaidSyntax: sync({ classes, relations: get().relations }) });
  },

  addRelation: (rel) => {
    const relations = [...get().relations, { ...rel, id: uid() }];
    set({ relations, mermaidSyntax: sync({ classes: get().classes, relations }) });
  },

  updateRelation: (id, patch) => {
    const relations = get().relations.map((r) => r.id === id ? { ...r, ...patch } : r);
    set({ relations, mermaidSyntax: sync({ classes: get().classes, relations }) });
  },

  deleteRelation: (id) => {
    const relations = get().relations.filter((r) => r.id !== id);
    set({ relations, mermaidSyntax: sync({ classes: get().classes, relations }) });
  },

  importFromSyntax: (syntax) => {
    const state = parseClassDiagramSyntax(syntax);
    set({ ...state, mermaidSyntax: sync(state), selectedClassId: null });
  },
}));
