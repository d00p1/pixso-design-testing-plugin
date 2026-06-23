import { Metadata } from './metadata';

export class DesignArtifact {
  constructor(
    public readonly id: string,
    public readonly designId: string,
    public readonly version: number,
    public readonly name: string,
    public readonly type: string,
    public readonly width: number,
    public readonly height: number,
    public readonly exportedAt: Date,
    public readonly imagePath: string,
    public readonly metadata: Metadata,
  ) {}

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      designId: this.designId,
      version: this.version,
      name: this.name,
      type: this.type,
      width: this.width,
      height: this.height,
      exportedAt: this.exportedAt.toISOString(),
      imagePath: this.imagePath,
      metadata: this.metadata.toJSON(),
    };
  }

  static fromJSON(data: Record<string, unknown>): DesignArtifact {
    return new DesignArtifact(
      data.id as string,
      data.designId as string,
      data.version as number,
      data.name as string,
      data.type as string,
      data.width as number,
      data.height as number,
      new Date(data.exportedAt as string),
      data.imagePath as string,
      Metadata.fromJSON(data.metadata as Record<string, unknown>),
    );
  }
}
