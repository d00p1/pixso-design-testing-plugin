export interface NodeId {
  readonly id: string;
}

export interface Node extends NodeId {
  readonly name: string;
  readonly type: NodeType;
  readonly width: number;
  readonly height: number;
  readonly parentName: string | null;
  readonly pageName: string;
}

export type NodeType =
  | 'FRAME'
  | 'COMPONENT'
  | 'COMPONENT_SET'
  | 'INSTANCE'
  | 'GROUP'
  | 'SECTION'
  | 'RECTANGLE'
  | 'TEXT'
  | 'LINE'
  | 'ELLIPSE'
  | 'POLYGON'
  | 'STAR'
  | 'VECTOR'
  | 'BOOLEAN_OPERATION'
  | 'SLICE';

export function buildNodePath(node: Node): string {
  const parts: string[] = [node.name];
  let parent = node.parentName;
  while (parent) {
    parts.unshift(parent);
    parent = null;
  }
  return parts.join('/');
}
