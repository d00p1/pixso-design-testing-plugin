import type { DesignArtifact } from '../models/design-artifact';
import type { DesignVersion } from '../models/design-version';

export interface DesignTestMapping {
  designId: string;
  testPath: string;
  componentSelector: string;
}

export interface ArtifactStoragePort {
  saveArtifact(artifact: DesignArtifact, pngData: Uint8Array): Promise<void>;
  getArtifact(designId: string): Promise<DesignArtifact | null>;
  getVersions(designId: string): Promise<DesignVersion[]>;
  saveVersion(designId: string, version: DesignVersion): Promise<void>;
  getLatestVersion(designId: string): Promise<number>;
  saveMapping(mapping: DesignTestMapping): Promise<void>;
  getMappings(): Promise<DesignTestMapping[]>;
  getMappingByDesignId(designId: string): Promise<DesignTestMapping | null>;
}
