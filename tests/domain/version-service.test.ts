import { describe, it, expect, beforeEach } from 'vitest';
import { VersionService } from '../../src/domain/services/version.service';
import type { ArtifactStoragePort, DesignTestMapping } from '../../src/domain/ports/artifact-storage.port';
import type { DesignArtifact } from '../../src/domain/models/design-artifact';
import type { DesignVersion } from '../../src/domain/models/design-version';

class InMemoryStorage implements ArtifactStoragePort {
  artifacts: Map<string, DesignArtifact> = new Map();
  versions: Map<string, DesignVersion[]> = new Map();
  mappings: DesignTestMapping[] = [];

  async saveArtifact(a: DesignArtifact): Promise<void> { this.artifacts.set(a.designId, a); }
  async getArtifact(id: string): Promise<DesignArtifact | null> { return this.artifacts.get(id) ?? null; }
  async getVersions(id: string): Promise<DesignVersion[]> { return this.versions.get(id) ?? []; }
  async saveVersion(id: string, v: DesignVersion): Promise<void> {
    const arr = this.versions.get(id) ?? [];
    arr.push(v);
    this.versions.set(id, arr);
  }
  async getLatestVersion(id: string): Promise<number> {
    const arr = this.versions.get(id) ?? [];
    return arr.length > 0 ? Math.max(...arr.map(v => v.version)) : 0;
  }
  async saveMapping(m: DesignTestMapping): Promise<void> { this.mappings.push(m); }
  async getMappings(): Promise<DesignTestMapping[]> { return this.mappings; }
  async getMappingByDesignId(id: string): Promise<DesignTestMapping | null> {
    return this.mappings.find(m => m.designId === id) ?? null;
  }
}

describe('VersionService', () => {
  let storage: InMemoryStorage;
  let service: VersionService;

  beforeEach(() => {
    storage = new InMemoryStorage();
    service = new VersionService(storage);
  });

  it('should return version 1 for new design', async () => {
    const next = await service.getNextVersion('new-card');
    expect(next).toBe(1);
  });

  it('should increment version for existing design', async () => {
    await service.createVersion('test-card');
    const next = await service.getNextVersion('test-card');
    expect(next).toBe(2);
  });

  it('should create version with comment', async () => {
    const version = await service.createVersion('test-card', 'Updated colors');
    expect(version.version).toBe(1);
    expect(version.comment).toBe('Updated colors');
    expect(version.createdAt).toBeInstanceOf(Date);
  });
});
