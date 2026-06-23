import type { NodeReaderPort } from '../../domain/ports/node-reader.port';
import type { Node } from '../../domain/models/node';

export class PixsoNodeAdapter implements NodeReaderPort {
  async getSelectedNode(): Promise<Node | null> {
    const selection = pixso.currentPage.selection;
    if (selection.length === 0) return null;

    const node = selection[0];
    return this.mapNode(node);
  }

  async getNodeById(id: string): Promise<Node | null> {
    const node = pixso.getNodeById(id);
    if (!node) return null;
    return this.mapNode(node);
  }

  async getCurrentPageName(): Promise<string> {
    return pixso.currentPage.name;
  }

  async getProjectName(): Promise<string> {
    return pixso.root.name;
  }

  private mapNode(node: SceneNode): Node {
    const parentName =
      node.parent && node.parent.type !== 'PAGE' && node.parent.type !== 'DOCUMENT'
        ? node.parent.name
        : null;

    const pageName =
      node.parent?.type === 'PAGE'
        ? (node.parent as PageNode).name
        : pixso.currentPage.name;

    return {
      id: node.id,
      name: node.name,
      type: node.type as Node['type'],
      width: 'width' in node ? (node as FrameNode).width : 0,
      height: 'height' in node ? (node as FrameNode).height : 0,
      parentName,
      pageName,
    };
  }
}
