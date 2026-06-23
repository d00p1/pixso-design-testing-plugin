import type { ArtifactStoragePort } from '../ports/artifact-storage.port';
import { DesignVersion } from '../models/design-version';

export class VersionService {
  constructor(private readonly storage: ArtifactStoragePort) {}

  async getNextVersion(designId: string): Promise<number> {
    const latest = await this.storage.getLatestVersion(designId);
    return latest + 1;
  }

  async createVersion(
    designId: string,
    comment?: string,
  ): Promise<DesignVersion> {
    const nextVersion = await this.getNextVersion(designId);
    const version = new DesignVersion(nextVersion, new Date(), comment);
    await this.storage.saveVersion(designId, version);
    return version;
  }
}
