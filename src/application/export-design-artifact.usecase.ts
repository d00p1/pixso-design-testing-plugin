import { DesignArtifact } from '../domain/models/design-artifact';
import { Metadata } from '../domain/models/metadata';
import type { DesignProperties } from '../domain/models/design-properties';
import type { NodeReaderPort } from '../domain/ports/node-reader.port';
import type { ImageExporterPort, ExportOptions } from '../domain/ports/image-exporter.port';
import type { MetadataExtractorPort } from '../domain/ports/metadata-extractor.port';
import type { ArtifactStoragePort } from '../domain/ports/artifact-storage.port';
import type { DesignPropertiesExtractorPort } from '../domain/ports/design-properties-extractor.port';
import { VersionService } from '../domain/services/version.service';
import type { Result } from '../shared/result';
import { success, failure } from '../shared/result';

export interface ExportInput {
  nodeId: string;
  designId: string;
  exportOptions?: ExportOptions;
  comment?: string;
  tags?: string[];
  testId?: string;
}

export interface ExportOutput {
  artifact: DesignArtifact;
  pngData: Uint8Array;
  svgData?: Uint8Array;
  designProperties?: DesignProperties;
}

export class ExportDesignArtifactUseCase {
  constructor(
    private readonly nodeReader: NodeReaderPort,
    private readonly imageExporter: ImageExporterPort,
    private readonly metadataExtractor: MetadataExtractorPort,
    private readonly storage: ArtifactStoragePort,
    private readonly versionService: VersionService,
    private readonly propertiesExtractor: DesignPropertiesExtractorPort,
  ) {}

  async execute(input: ExportInput): Promise<Result<ExportOutput>> {
    try {
      const node = await this.nodeReader.getNodeById(input.nodeId);
      if (!node) {
        return failure(new Error(`Node ${input.nodeId} not found`));
      }

      const nextVersion = await this.versionService.getNextVersion(
        input.designId,
      );

      const baseMetadata = await this.metadataExtractor.extract(node);
      let metadata = baseMetadata;
      if (input.testId) {
        metadata = metadata.withTestId(input.testId);
      }
      if (input.tags && input.tags.length > 0) {
        metadata = metadata.withTags(input.tags);
      }

      const pngData = await this.imageExporter.export(node, {
        format: 'PNG',
        scale: input.exportOptions?.scale,
        contentsOnly: input.exportOptions?.contentsOnly,
      });

      let svgData: Uint8Array | undefined;

      if (input.exportOptions?.includeSvg) {
        svgData = await this.imageExporter.export(node, {
          format: 'SVG',
          contentsOnly: input.exportOptions?.contentsOnly,
          svgOutlineText: input.exportOptions?.svgOutlineText ?? true,
          svgIdAttribute: input.exportOptions?.svgIdAttribute ?? true,
        });
      }

      let designProperties: DesignProperties | undefined;

      if (input.exportOptions?.includeDesignProperties !== false) {
        designProperties = await this.propertiesExtractor.extract(
          input.nodeId,
        );
      }

      const artifact = new DesignArtifact(
        this.generateId(),
        input.designId,
        nextVersion,
        node.name,
        node.type,
        node.width,
        node.height,
        new Date(),
        `design-artifacts/${input.designId}/reference.png`,
        metadata,
      );

      await this.storage.saveArtifact(artifact, pngData);
      await this.versionService.createVersion(input.designId, input.comment);

      return success({ artifact, pngData, svgData, designProperties });
    } catch (error) {
      return failure(error as Error);
    }
  }

  private generateId(): string {
    return `artifact_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
