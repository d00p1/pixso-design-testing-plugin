export class Metadata {
  constructor(
    public readonly projectName: string,
    public readonly pageName: string,
    public readonly nodePath: string,
    public readonly testId?: string,
    public readonly tags: string[] = [],
  ) {}

  withTestId(testId: string): Metadata {
    return new Metadata(
      this.projectName,
      this.pageName,
      this.nodePath,
      testId,
      this.tags,
    );
  }

  withTags(tags: string[]): Metadata {
    return new Metadata(
      this.projectName,
      this.pageName,
      this.nodePath,
      this.testId,
      tags,
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      projectName: this.projectName,
      pageName: this.pageName,
      nodePath: this.nodePath,
      testId: this.testId ?? null,
      tags: this.tags,
    };
  }

  static fromJSON(data: Record<string, unknown>): Metadata {
    return new Metadata(
      data.projectName as string,
      data.pageName as string,
      data.nodePath as string,
      data.testId as string | undefined,
      (data.tags as string[]) ?? [],
    );
  }
}
