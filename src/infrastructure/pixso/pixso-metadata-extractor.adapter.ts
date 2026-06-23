import type { MetadataExtractorPort } from '../../domain/ports/metadata-extractor.port';
import type { Node } from '../../domain/models/node';
import { Metadata } from '../../domain/models/metadata';
import { buildNodePath } from '../../domain/models/node';

export class PixsoMetadataExtractor implements MetadataExtractorPort {
  constructor(
    private readonly projectName: string,
    private readonly pageName: string,
  ) {}

  async extract(node: Node): Promise<Metadata> {
    const nodePath = buildNodePath(node);

    return new Metadata(
      this.projectName,
      node.pageName || this.pageName,
      nodePath,
      undefined,
      [],
    );
  }

  static fromNode(
    node: Node,
    projectName: string,
    pageName: string,
  ): Metadata {
    return new Metadata(
      projectName,
      node.pageName || pageName,
      buildNodePath(node),
      undefined,
      [],
    );
  }
}
