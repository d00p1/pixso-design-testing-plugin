import { PixsoNodeAdapter } from './infrastructure/pixso/pixso-node.adapter';
import { PixsoImageExporter } from './infrastructure/pixso/pixso-image-exporter.adapter';
import { PixsoMetadataExtractor } from './infrastructure/pixso/pixso-metadata-extractor.adapter';
import { PixsoDesignPropertiesExtractor } from './infrastructure/pixso/pixso-design-properties-extractor.adapter';
import { LocalStorageRepository } from './infrastructure/storage/local-storage.repository';
import { VersionService } from './domain/services/version.service';
import { ExportDesignArtifactUseCase } from './application/export-design-artifact.usecase';
import { GenerateMetadataUseCase } from './application/generate-metadata.usecase';
import { CreateVersionUseCase } from './application/create-version.usecase';
import { DesignTestMappingRepository } from './infrastructure/mapping/design-test-mapping.repository';
import { createZip } from './shared/archive';

const nodeReader = new PixsoNodeAdapter();
const imageExporter = new PixsoImageExporter();
const storage = new LocalStorageRepository();
const versionService = new VersionService(storage);
const mappingRepo = new DesignTestMappingRepository(storage);

const metadataExtractor = new PixsoMetadataExtractor('', '');
const propertiesExtractor = new PixsoDesignPropertiesExtractor();

const exportUseCase = new ExportDesignArtifactUseCase(
  nodeReader,
  imageExporter,
  metadataExtractor,
  storage,
  versionService,
  propertiesExtractor,
);

const generateMetaUseCase = new GenerateMetadataUseCase(
  nodeReader,
  metadataExtractor,
);

const createVersionUseCase = new CreateVersionUseCase(versionService);

pixso.showUI(__html__, {
  width: 340,
  height: 580,
  title: 'Design Testing Export',
});

async function getCurrentSelectionInfo() {
  const node = await nodeReader.getSelectedNode();
  const projectName = await nodeReader.getProjectName();
  const pageName = await nodeReader.getCurrentPageName();

  pixso.ui.postMessage({
    type: 'selection-update',
    payload: node
      ? {
          id: node.id,
          name: node.name,
          type: node.type,
          width: node.width,
          height: node.height,
          projectName,
          pageName,
        }
      : null,
  });
}

async function handleExport(params: {
  nodeId: string;
  designId: string;
  scale?: number;
  comment?: string;
  tags?: string[];
  testId?: string;
  includeSvg?: boolean;
  svgOutlineText?: boolean;
  svgIdAttribute?: boolean;
  includeDesignProperties?: boolean;
}) {
  pixso.ui.postMessage({ type: 'export-started' });

  const result = await exportUseCase.execute({
    nodeId: params.nodeId,
    designId: params.designId,
    exportOptions: {
      scale: params.scale ?? 2,
      format: 'PNG',
      includeSvg: params.includeSvg,
      svgOutlineText: params.svgOutlineText,
      svgIdAttribute: params.svgIdAttribute,
      includeDesignProperties: params.includeDesignProperties ?? true,
    },
    comment: params.comment,
    tags: params.tags,
    testId: params.testId,
  });

  if (result.ok) {
    const { artifact, pngData, svgData, designProperties } = result.value;
    const versions = await storage.getVersions(artifact.designId);
    const changelog = JSON.stringify(versions.map((v) => v.toJSON()), null, 2);
    const metaJson = JSON.stringify(artifact.toJSON(), null, 2);

    const zipFiles: Record<string, Uint8Array | string> = {
      'reference.png': pngData,
      'meta.json': metaJson,
      'changelog.json': changelog,
    };

    if (svgData) {
      zipFiles['reference.svg'] = svgData;
    }

    if (designProperties) {
      zipFiles['design.json'] = JSON.stringify(designProperties, null, 2);
    }

    const zipName = `${artifact.designId}-v${artifact.version}.zip`;
    const zipData = createZip(zipFiles);

    pixso.ui.postMessage({
      type: 'export-complete',
      payload: {
        artifact: artifact.toJSON(),
        zipBase64: pixso.base64Encode(zipData),
        zipName,
      },
    });
  } else {
    pixso.ui.postMessage({
      type: 'export-error',
      payload: result.error.message,
    });
  }
}

async function handleGetVersions(designId: string) {
  const versions = await storage.getVersions(designId);
  pixso.ui.postMessage({
    type: 'versions-response',
    payload: versions.map((v) => v.toJSON()),
  });
}

async function handleSaveMapping(params: {
  designId: string;
  testPath: string;
  componentSelector: string;
}) {
  await mappingRepo.linkDesignToTest(
    params.designId,
    params.testPath,
    params.componentSelector,
  );
  pixso.ui.postMessage({ type: 'mapping-saved' });
}

pixso.ui.onmessage = async (msg: {
  type: string;
  payload?: Record<string, unknown>;
}) => {
  switch (msg.type) {
    case 'get-selection':
      await getCurrentSelectionInfo();
      break;
    case 'export':
      await handleExport(msg.payload as {
        nodeId: string;
        designId: string;
        scale?: number;
        comment?: string;
        tags?: string[];
        testId?: string;
        includeSvg?: boolean;
        svgOutlineText?: boolean;
        svgIdAttribute?: boolean;
        includeDesignProperties?: boolean;
      });
      break;
    case 'get-versions':
      await handleGetVersions((msg.payload as { designId: string }).designId);
      break;
    case 'save-mapping':
      await handleSaveMapping(msg.payload as {
        designId: string;
        testPath: string;
        componentSelector: string;
      });
      break;
  }
};

pixso.on('selectionchange', () => {
  getCurrentSelectionInfo();
});

getCurrentSelectionInfo();
