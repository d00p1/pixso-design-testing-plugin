import type {
  ArtifactStoragePort,
  DesignTestMapping,
} from "../../domain/ports/artifact-storage.port";
import { DesignArtifact } from "../../domain/models/design-artifact";
import type { DesignVersion } from "../../domain/models/design-version";
import { DesignVersion as DesignVersionModel } from "../../domain/models/design-version";

const ARTIFACT_PREFIX = "artifact_";
const VERSION_PREFIX = "version_";
const MAPPING_KEY = "design_test_mappings";

export class LocalStorageRepository implements ArtifactStoragePort {
  async saveArtifact(
    artifact: DesignArtifact,
    _pngData: Uint8Array,
  ): Promise<void> {
    const key = ARTIFACT_PREFIX + artifact.designId;
    await pixso.clientStorage.setAsync(key, artifact.toJSON());
  }

  async getArtifact(designId: string): Promise<DesignArtifact | null> {
    const key = ARTIFACT_PREFIX + designId;
    const data = await pixso.clientStorage.getAsync(key);
    if (!data) return null;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return DesignArtifact.fromJSON(parsed);
    } catch {
      return null;
    }
  }

  async getVersions(designId: string): Promise<DesignVersion[]> {
    const key = VERSION_PREFIX + designId;
    const data = await pixso.clientStorage.getAsync(key);
    if (!data) return [];
    try {
      const parsed: Record<string, unknown>[] =
        typeof data === "string" ? JSON.parse(data) : data;
      return parsed.map(DesignVersionModel.fromJSON);
    } catch {
      return [];
    }
  }

  async saveVersion(designId: string, version: DesignVersion): Promise<void> {
    const key = VERSION_PREFIX + designId;
    const existing = await this.getVersions(designId);
    existing.push(version);
    await pixso.clientStorage.setAsync(
      key,
      JSON.stringify(existing.map((v) => v.toJSON())),
    );
  }

  async getLatestVersion(designId: string): Promise<number> {
    const versions = await this.getVersions(designId);
    if (versions.length === 0) return 0;
    return Math.max(...versions.map((v) => v.version));
  }

  async saveMapping(mapping: DesignTestMapping): Promise<void> {
    const mappings = await this.getMappings();
    const existing = mappings.findIndex((m) => m.designId === mapping.designId);
    if (existing >= 0) {
      mappings[existing] = mapping;
    } else {
      mappings.push(mapping);
    }
    await pixso.clientStorage.setAsync(MAPPING_KEY, JSON.stringify(mappings));
  }

  async getMappings(): Promise<DesignTestMapping[]> {
    const data = await pixso.clientStorage.getAsync(MAPPING_KEY);
    if (!data) return [];
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return [];
    }
  }

  async getMappingByDesignId(
    designId: string,
  ): Promise<DesignTestMapping | null> {
    const mappings = await this.getMappings();
    return mappings.find((m) => m.designId === designId) ?? null;
  }
}
