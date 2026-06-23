import { describe, it, expect } from 'vitest';
import { Metadata } from '../../src/domain/models/metadata';

describe('Metadata', () => {
  it('should create with required fields', () => {
    const meta = new Metadata('Project', 'Page', 'Page/Frame');
    expect(meta.projectName).toBe('Project');
    expect(meta.pageName).toBe('Page');
    expect(meta.nodePath).toBe('Page/Frame');
    expect(meta.testId).toBeUndefined();
    expect(meta.tags).toEqual([]);
  });

  it('should add testId immutably', () => {
    const meta = new Metadata('Project', 'Page', 'Page/Frame');
    const updated = meta.withTestId('test.spec.ts');
    expect(updated.testId).toBe('test.spec.ts');
    expect(meta.testId).toBeUndefined();
  });

  it('should add tags immutably', () => {
    const meta = new Metadata('Project', 'Page', 'Page/Frame');
    const updated = meta.withTags(['catalog', 'card']);
    expect(updated.tags).toEqual(['catalog', 'card']);
    expect(meta.tags).toEqual([]);
  });

  it('should serialize and deserialize', () => {
    const meta = new Metadata('Project', 'Page', 'Page/Frame', 'test.spec.ts', ['tag']);
    const json = meta.toJSON();
    const restored = Metadata.fromJSON(json);
    expect(restored.projectName).toBe('Project');
    expect(restored.testId).toBe('test.spec.ts');
    expect(restored.tags).toEqual(['tag']);
  });
});
