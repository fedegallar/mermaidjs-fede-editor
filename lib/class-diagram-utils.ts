import {
  ClassDiagramState,
  ClassMember,
  ClassNode,
  ClassRelation,
  MemberKind,
  RelationType,
  RELATION_CONFIGS,
  Visibility,
} from "./class-diagram-types";

// ── Generator ─────────────────────────────────────────────────────────────────

function renderMember(m: ClassMember): string {
  const stat = m.isStatic ? "$" : "";
  const abst = m.isAbstract ? "*" : "";
  if (m.kind === "attribute") {
    return `    ${m.visibility}${m.type} ${m.name}${stat}${abst}`;
  }
  return `    ${m.visibility}${m.name}(${m.params})${stat}${abst} ${m.type}`.trimEnd();
}

function renderRelation(r: ClassRelation, classes: ClassNode[]): string {
  const from = classes.find((c) => c.id === r.fromId);
  const to   = classes.find((c) => c.id === r.toId);
  if (!from || !to) return "";

  const cfg = RELATION_CONFIGS[r.type];
  const fromCard = r.fromLabel ? `"${r.fromLabel}" ` : "";
  const toCard   = r.toLabel   ? ` "${r.toLabel}"` : "";
  const lbl      = r.label     ? ` : ${r.label}` : "";

  return `  ${from.name} ${fromCard}${cfg.arrow}${toCard} ${to.name}${lbl}`;
}

export function generateClassDiagramSyntax(state: ClassDiagramState): string {
  const sorted = [...state.classes].sort((a, b) => a.order - b.order);
  const classBlocks = sorted.map((cls) => {
    const lines: string[] = [`  class ${cls.name} {`];
    if (cls.annotation) lines.push(`    ${cls.annotation}`);
    cls.members.forEach((m) => lines.push(renderMember(m)));
    lines.push("  }");
    return lines.join("\n");
  });

  const relationLines = state.relations
    .map((r) => renderRelation(r, state.classes))
    .filter(Boolean);

  return ["classDiagram", ...classBlocks, ...relationLines].join("\n");
}

// ── Parser ─────────────────────────────────────────────────────────────────────

let _idCounter = 0;
const uid = () => `cd_${++_idCounter}_${Date.now()}`;

function parseVisibility(ch: string): Visibility {
  if (ch === "+" || ch === "-" || ch === "#" || ch === "~") return ch as Visibility;
  return "+";
}

function parseMember(line: string): ClassMember | null {
  const raw = line.trim();
  if (!raw || raw.startsWith("<<")) return null;

  const vis = parseVisibility(raw[0]);
  const body = (raw[0].match(/[+\-#~]/) ? raw.slice(1) : raw).trim();

  const isStatic   = body.endsWith("$");
  const isAbstract = body.replace(/\$$/, "").endsWith("*");
  const clean = body.replace(/\*$/, "").replace(/\$$/, "").trim();

  // Method: has parentheses
  const methodMatch = clean.match(/^(\S+)\(([^)]*)\)\s*(.*)$/);
  if (methodMatch) {
    return {
      id: uid(), kind: "method", visibility: vis,
      name: methodMatch[1], params: methodMatch[2].trim(),
      type: methodMatch[3].trim(), isStatic, isAbstract,
    };
  }

  // Attribute: "Type name" or "name Type"
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return {
      id: uid(), kind: "attribute", visibility: vis,
      type: parts[0], name: parts.slice(1).join(" "),
      params: "", isStatic, isAbstract,
    };
  }
  return {
    id: uid(), kind: "attribute", visibility: vis,
    type: "", name: parts[0] ?? clean,
    params: "", isStatic, isAbstract,
  };
}

function parseRelationType(arrow: string): RelationType {
  const map: Record<string, RelationType> = {
    "<|--": "inheritance", "--|>": "inheritance",
    "..|>": "realization",  "<|..": "realization",
    "*--": "composition",   "--*": "composition",
    "o--": "aggregation",   "--o": "aggregation",
    "-->": "association",   "<--": "association",
    "..>": "dependency",    "<..": "dependency",
    "--": "link",
  };
  return map[arrow] ?? "association";
}

export function parseClassDiagramSyntax(syntax: string): ClassDiagramState {
  _idCounter = 0;
  const classes: ClassNode[] = [];
  const relations: ClassRelation[] = [];
  const lines = syntax.split("\n");

  let currentClass: ClassNode | null = null;
  let order = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === "classDiagram") continue;

    // Class block open: "class Foo {"
    const classOpen = line.match(/^class\s+(\w+)\s*\{?$/);
    if (classOpen) {
      if (currentClass) classes.push(currentClass);
      currentClass = {
        id: uid(), name: classOpen[1], annotation: "",
        members: [], order: order++,
      };
      continue;
    }

    // Class block close
    if (line === "}") {
      if (currentClass) { classes.push(currentClass); currentClass = null; }
      continue;
    }

    // Inside a class block
    if (currentClass) {
      if (line.startsWith("<<") && line.endsWith(">>")) {
        currentClass.annotation = line;
      } else {
        const member = parseMember(line);
        if (member) currentClass.members.push(member);
      }
      continue;
    }

    // Bare annotation: "ClassName : <<Annotation>>"
    const bareAnnotation = line.match(/^(\w+)\s*:\s*(<<\w+>>)$/);
    if (bareAnnotation) {
      const cls = classes.find((c) => c.name === bareAnnotation[1]);
      if (cls) cls.annotation = bareAnnotation[2];
      continue;
    }

    // Bare member: "ClassName : member"
    const bareMember = line.match(/^(\w+)\s*:\s*(.+)$/);
    if (bareMember) {
      let cls = classes.find((c) => c.name === bareMember[1]);
      if (!cls) {
        cls = { id: uid(), name: bareMember[1], annotation: "", members: [], order: order++ };
        classes.push(cls);
      }
      const member = parseMember(bareMember[2]);
      if (member) cls.members.push(member);
      continue;
    }

    // Relation: A <|-- B : label  (with optional cardinality "1" "many")
    const relRaw = line.replace(/\s*:.*$/, "");
    const label  = line.includes(":") ? line.slice(line.indexOf(":") + 1).trim() : "";

    const relMatch = relRaw.match(
      /^(\w+)\s*"?([^"]*)"?\s*(<\|--|\.\.>\||\.\.>\||\*--|o--|-->|<--|\.\.>|<\.\.|--|\|>\.\.|\|>--)\s*"?([^"]*)"?\s*(\w+)$/
    );
    if (relMatch) {
      const [, fromName, fromLabel, arrow, toLabel, toName] = relMatch;
      let from = classes.find((c) => c.name === fromName);
      let to   = classes.find((c) => c.name === toName);
      if (!from) { from = { id: uid(), name: fromName, annotation: "", members: [], order: order++ }; classes.push(from); }
      if (!to)   { to   = { id: uid(), name: toName,   annotation: "", members: [], order: order++ }; classes.push(to); }
      relations.push({
        id: uid(), fromId: from.id, toId: to.id,
        type: parseRelationType(arrow),
        fromLabel: fromLabel.trim(), toLabel: toLabel.trim(), label,
      });
    }
  }
  if (currentClass) classes.push(currentClass);

  if (classes.length === 0) {
    classes.push({ id: uid(), name: "ClaseEjemplo", annotation: "", members: [], order: 0 });
  }
  return { classes, relations };
}
