import type { NodeReaderPort } from '../domain/ports/node-reader.port';
import type { MetadataExtractorPort } from '../domain/ports/metadata-extractor.port';
import type { Node } from '../domain/models/node';
import { Metadata } from '../domain/models/metadata';
import type { Result } from '../shared/result';
import { success, failure } from '../shared/result';

export class GenerateMetadataUseCase {
  constructor(
    private readonly nodeReader: NodeReaderPort,
    private readonly metadataExtractor: MetadataExtractorPort,
  ) {}

  async execute(nodeId?: string): Promise<Result<Metadata>> {
    let node: Node | null;

    if (nodeId) {
      node = await this.nodeReader.getNodeById(nodeId);
    } else {
      node = await this.nodeReader.getSelectedNode();
    }

    if (!node) {
      return failure(new Error('No node selected or found'));
    }

    const metadata = await this.metadataExtractor.extract(node);
    return success(metadata);
  }
}
