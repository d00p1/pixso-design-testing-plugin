import { VersionService } from '../domain/services/version.service';
import type { DesignVersion } from '../domain/models/design-version';
import type { Result } from '../shared/result';
import { success, failure } from '../shared/result';

export class CreateVersionUseCase {
  constructor(private readonly versionService: VersionService) {}

  async execute(
    designId: string,
    comment?: string,
  ): Promise<Result<DesignVersion>> {
    try {
      const version = await this.versionService.createVersion(
        designId,
        comment,
      );
      return success(version);
    } catch (error) {
      return failure(error as Error);
    }
  }
}
