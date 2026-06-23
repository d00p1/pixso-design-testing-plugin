import { describe, it, expect } from 'vitest';
import { DesignArtifact } from '../../src/domain/models/design-artifact';
import { Metadata } from '../../src/domain/models/metadata';

describe('DesignArtifact', () => {
  const metadata = new Metadata('Test Project', 'Page 1', 'Page/Frame');
  const artifact = new DesignArtifact(
    'id-1',
    'test-card',
    1,
    'TestCard',
    'FRAME',
    320,
    480,
    new Date('2026-06-22T11:00:00Z'),
    'design-artifacts/test-card/reference.png',
    metadata,
  );

  it('should serialize to JSON', () => {
    const json = artifact.toJSON();
    expect(json.id).toBe('id-1');
    expect(json.designId).toBe('test-card');
    expect(json.version).toBe(1);
    expect(json.name).toBe('TestCard');
    expect(json.type).toBe('FRAME');
    expect(json.width).toBe(320);
    expect(json.height).toBe(480);
  });

  it('should deserialize from JSON', () => {
    const json = artifact.toJSON();
    const restored = DesignArtifact.fromJSON(json);
    expect(restored.id).toBe(artifact.id);
    expect(restored.designId).toBe(artifact.designId);
    expect(restored.version).toBe(artifact.version);
    expect(restored.name).toBe(artifact.name);
    expect(restored.exportedAt.toISOString()).toBe(artifact.exportedAt.toISOString());
  });
});
