import type { Node } from '../models/node';
import { Metadata } from '../models/metadata';

export interface MetadataExtractorPort {
  extract(node: Node): Promise<Metadata>;
}
