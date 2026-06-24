type RGBA = { r: number; g: number; b: number; a: number };

export interface ConstraintProperties {
  horizontal: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE';
  vertical: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE';
}

export interface CornerProperties {
  cornerRadius?: number;
  cornerSmoothing?: number;
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomLeftRadius?: number;
  bottomRightRadius?: number;
}

export interface FillProperties {
  type:
    | 'SOLID'
    | 'GRADIENT_LINEAR'
    | 'GRADIENT_RADIAL'
    | 'GRADIENT_ANGULAR'
    | 'GRADIENT_DIAMOND'
    | 'IMAGE';
  visible?: boolean;
  opacity?: number;
  blendMode?: string;
  color?: { r: number; g: number; b: number };
  gradientStops?: Array<{ position: number; color: RGBA }>;
  scaleMode?: 'FILL' | 'FIT' | 'CROP' | 'TILE';
  imageHash?: string | null;
}

export interface StrokeProperties extends FillProperties {
  weight: number;
  align: 'CENTER' | 'INSIDE' | 'OUTSIDE';
  join?: 'MITER' | 'BEVEL' | 'ROUND';
  cap?: 'NONE' | 'ROUND' | 'SQUARE' | 'ARROW_LINES' | 'ARROW_EQUILATERAL';
  dashPattern?: number[];
  topWeight?: number;
  bottomWeight?: number;
  leftWeight?: number;
  rightWeight?: number;
}

export interface EffectProperties {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible: boolean;
  radius: number;
  color?: RGBA;
  offset?: { x: number; y: number };
  spread?: number;
  blendMode?: string;
}

export interface TypographyProperties {
  characters: string;
  fontSize: number;
  fontName: { family: string; style: string };
  textCase: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
  textDecoration: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
  letterSpacing: { value: number; unit: 'PIXELS' | 'PERCENT' };
  lineHeight: { value?: number; unit: 'PIXELS' | 'PERCENT' | 'AUTO' };
  paragraphSpacing: number;
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM';
  textAutoResize: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE';
  hyperlink?: { type: 'URL' | 'NODE'; value: string } | null;
}

export interface LayoutGridProperties {
  pattern: 'ROWS' | 'COLUMNS' | 'GRID';
  alignment?: 'MIN' | 'MAX' | 'STRETCH' | 'CENTER';
  gutterSize?: number;
  count?: number;
  sectionSize?: number;
  offset?: number;
  visible?: boolean;
  color?: RGBA;
}

export interface LayoutProperties {
  mode: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  wrap: 'NO_WRAP' | 'WRAP';
  primaryAxisSizingMode: 'FIXED' | 'AUTO';
  counterAxisSizingMode: 'FIXED' | 'AUTO';
  primaryAxisAlignItems: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  itemSpacing: number;
  itemReverseZIndex: boolean;
  strokesIncludedInLayout: boolean;
  clipsContent: boolean;
  layoutGrids?: LayoutGridProperties[];
  layoutAlign?: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'INHERIT';
  layoutGrow?: number;
}

export interface DesignProperties {
  layout?: LayoutProperties;
  fills: FillProperties[];
  strokes: StrokeProperties[];
  effects: EffectProperties[];
  corners?: CornerProperties;
  typography?: TypographyProperties;
  opacity: number;
  blendMode: string;
  visible: boolean;
  constraints?: ConstraintProperties;
  children?: DesignProperties[];
}
