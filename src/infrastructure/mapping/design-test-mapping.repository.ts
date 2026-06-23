import type { ArtifactStoragePort, DesignTestMapping } from '../../domain/ports/artifact-storage.port';

export class DesignTestMappingRepository {
  constructor(private readonly storage: ArtifactStoragePort) {}

  async linkDesignToTest(
    designId: string,
    testPath: string,
    componentSelector: string,
  ): Promise<void> {
    await this.storage.saveMapping({ designId, testPath, componentSelector });
  }

  async getTestForDesign(designId: string): Promise<DesignTestMapping | null> {
    return this.storage.getMappingByDesignId(designId);
  }

  async getAllMappings(): Promise<DesignTestMapping[]> {
    return this.storage.getMappings();
  }
}
