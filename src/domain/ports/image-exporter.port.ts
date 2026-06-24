import type { Node } from '../models/node';

export interface ExportOptions {
  scale?: number;
  format?: 'PNG' | 'JPG' | 'SVG' | 'PDF';
  contentsOnly?: boolean;
  svgOutlineText?: boolean;
  svgIdAttribute?: boolean;
  includeSvg?: boolean;
  includeDesignProperties?: boolean;
}

export interface ImageExporterPort {
  export(node: Node, options?: ExportOptions): Promise<Uint8Array>;
}
