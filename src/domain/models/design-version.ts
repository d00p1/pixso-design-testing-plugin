export class DesignVersion {
  constructor(
    public readonly version: number,
    public readonly createdAt: Date,
    public readonly comment?: string,
  ) {}

  toJSON(): Record<string, unknown> {
    return {
      version: this.version,
      createdAt: this.createdAt.toISOString(),
      ...(this.comment ? { comment: this.comment } : {}),
    };
  }

  static fromJSON(data: Record<string, unknown>): DesignVersion {
    return new DesignVersion(
      data.version as number,
      new Date(data.createdAt as string),
      data.comment as string | undefined,
    );
  }
}
