import type { ImageExporterPort, ExportOptions } from '../../domain/ports/image-exporter.port';
import type { Node } from '../../domain/models/node';

export class PixsoImageExporter implements ImageExporterPort {
  async export(node: Node, options?: ExportOptions): Promise<Uint8Array> {
    const pixsoNode = pixso.getNodeById(node.id) as
      | FrameNode
      | ComponentNode
      | ComponentSetNode
      | GroupNode
      | InstanceNode
      | null;

    if (!pixsoNode) {
      throw new Error(`Node ${node.id} not found`);
    }

    if (!('exportAsync' in pixsoNode)) {
      throw new Error(`Node ${node.id} does not support export`);
    }

    const format = options?.format ?? 'PNG';

    return (pixsoNode as unknown as { exportAsync(settings: Record<string, unknown>): Promise<Uint8Array> }).exportAsync({
      format,
      contentsOnly: options?.contentsOnly ?? true,
      ...(options?.scale
        ? { constraint: { type: 'SCALE', value: options.scale } }
        : {}),
    });
  }
}
