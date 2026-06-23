import type { Node } from '../models/node';

export interface NodeReaderPort {
  getSelectedNode(): Promise<Node | null>;
  getNodeById(id: string): Promise<Node | null>;
  getCurrentPageName(): Promise<string>;
  getProjectName(): Promise<string>;
}
