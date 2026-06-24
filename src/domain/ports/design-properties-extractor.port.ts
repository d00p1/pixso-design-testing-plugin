import type { DesignProperties } from '../models/design-properties';

export interface DesignPropertiesExtractorPort {
  extract(nodeId: string): Promise<DesignProperties>;
}
