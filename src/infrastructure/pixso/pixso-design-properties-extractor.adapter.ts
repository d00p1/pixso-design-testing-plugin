import type { DesignPropertiesExtractorPort } from '../../domain/ports/design-properties-extractor.port';
import type {
  DesignProperties,
  LayoutProperties,
  FillProperties,
  StrokeProperties,
  EffectProperties,
  TypographyProperties,
  CornerProperties,
  ConstraintProperties,
  LayoutGridProperties,
} from '../../domain/models/design-properties';

function isMixed(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value === (pixso as unknown as { mixed: string }).mixed
  );
}

function asMixed<T>(value: T | string): T | undefined {
  if (isMixed(value)) return undefined;
  return value as T;
}

function asMixedWithDefault<T>(value: T | string, fallback: T): T {
  if (isMixed(value)) return fallback;
  return value as T;
}

function hasFillsStrokes(node: SceneNode): node is SceneNode & MinimalFillsMixin & MinimalStrokesMixin {
  return 'fills' in node && 'strokes' in node;
}

function hasEffects(node: SceneNode): node is SceneNode & BlendMixin {
  return 'effects' in node;
}

function hasOpacity(node: SceneNode): node is SceneNode & MinimalBlendMixin {
  return 'opacity' in node;
}

function hasLayout(node: SceneNode): node is SceneNode & BaseFrameMixin {
  return 'layoutMode' in node;
}

function hasChildren(node: SceneNode): node is SceneNode & ChildrenMixin {
  return 'children' in node;
}

function hasCorners(node: SceneNode): node is SceneNode & CornerMixin {
  return 'cornerRadius' in node;
}

function hasPerCorners(node: SceneNode): node is SceneNode & RectangleCornerMixin {
  return 'topLeftRadius' in node;
}

function hasConstraints(node: SceneNode): node is SceneNode & ConstraintMixin {
  return 'constraints' in node;
}

function hasIndividualStrokes(node: SceneNode): node is SceneNode & IndividualStrokesMixin {
  return 'strokeTopWeight' in node;
}

export class PixsoDesignPropertiesExtractor implements DesignPropertiesExtractorPort {
  async extract(nodeId: string): Promise<DesignProperties> {
    const node = pixso.getNodeById(nodeId) as SceneNode | null;
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }
    return this.mapNode(node);
  }

  private mapNode(node: SceneNode): DesignProperties {
    const visible = 'visible' in node
      ? asMixedWithDefault((node as SceneNodeMixin).visible, true)
      : true;

    const props: DesignProperties = {
      fills: this.mapFills(node),
      strokes: this.mapStrokes(node),
      effects: this.mapEffects(node),
      opacity: hasOpacity(node) ? asMixedWithDefault(node.opacity, 1) : 1,
      blendMode: hasOpacity(node) ? String(node.blendMode) : 'NORMAL',
      visible,
    };

    if (hasLayout(node)) {
      props.layout = this.mapLayout(node);
    }

    if (hasCorners(node)) {
      props.corners = this.mapCorners(node);
    }

    if (hasConstraints(node)) {
      props.constraints = this.mapConstraints(node);
    }

    if (node.type === 'TEXT') {
      props.typography = this.mapTypography(node as TextNode);
    }

    if (hasChildren(node)) {
      const children = node.children
        .filter(c => c.visible !== false)
        .map(c => this.mapNode(c));
      if (children.length > 0) {
        props.children = children;
      }
    }

    return props;
  }

  private mapFills(node: SceneNode): FillProperties[] {
    if (!hasFillsStrokes(node)) return [];
    const fills = node.fills;
    if (isMixed(fills)) return [];
    return fills.map(f => this.mapFillPaint(f));
  }

  private mapStrokes(node: SceneNode): StrokeProperties[] {
    if (!hasFillsStrokes(node)) return [];
    const strokes = node.strokes;
    if (isMixed(strokes)) return [];

    const weight = asMixedWithDefault(node.strokeWeight, 0);
    const align = asMixedWithDefault(node.strokeAlign, 'CENTER' as const);
    const join = asMixed(node.strokeJoin);
    const dashPattern = isMixed(node.dashPattern) ? undefined : [...node.dashPattern];

    const cap =
      'strokeCap' in node ? asMixed((node as { strokeCap: StrokeCap }).strokeCap) : undefined;

    const individualStrokes = hasIndividualStrokes(node)
      ? {
          topWeight: node.strokeTopWeight,
          bottomWeight: node.strokeBottomWeight,
          leftWeight: node.strokeLeftWeight,
          rightWeight: node.strokeRightWeight,
        }
      : {};

    return strokes.map(s => ({
      ...this.mapFillPaint(s),
      weight,
      align,
      ...(join ? { join: join as StrokeProperties['join'] } : {}),
      ...(cap ? { cap: cap as StrokeProperties['cap'] } : {}),
      ...(dashPattern && dashPattern.length > 0 ? { dashPattern } : {}),
      ...individualStrokes,
    }));
  }

  private mapFillPaint(paint: Paint): FillProperties {
    const base: FillProperties = {
      type: paint.type,
      visible: paint.visible,
      opacity: paint.opacity,
      blendMode: paint.blendMode,
    };

    if (paint.type === 'SOLID') {
      return {
        ...base,
        color: { r: paint.color.r, g: paint.color.g, b: paint.color.b },
      };
    }

    if (paint.type === 'IMAGE') {
      return {
        ...base,
        scaleMode: paint.scaleMode,
        imageHash: paint.imageHash,
      };
    }

    return {
      ...base,
      gradientStops: paint.gradientStops.map(s => ({
        position: s.position,
        color: { r: s.color.r, g: s.color.g, b: s.color.b, a: s.color.a },
      })),
    };
  }

  private mapEffects(node: SceneNode): EffectProperties[] {
    if (!hasEffects(node)) return [];
    const effects = node.effects;
    return effects.map(e => {
      const base: EffectProperties = {
        type: e.type,
        visible: e.visible,
        radius: e.radius,
      };

      if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') {
        return {
          ...base,
          color: { r: e.color.r, g: e.color.g, b: e.color.b, a: e.color.a },
          offset: { x: e.offset.x, y: e.offset.y },
          spread: e.spread,
          blendMode: e.blendMode,
        };
      }

      return base;
    });
  }

  private mapLayout(node: SceneNode & BaseFrameMixin): LayoutProperties {
    const layout: LayoutProperties = {
      mode: node.layoutMode,
      wrap: node.layoutWrap,
      primaryAxisSizingMode: node.primaryAxisSizingMode,
      counterAxisSizingMode: node.counterAxisSizingMode,
      primaryAxisAlignItems: node.primaryAxisAlignItems,
      counterAxisAlignItems: node.counterAxisAlignItems,
      paddingTop: node.paddingTop,
      paddingRight: node.paddingRight,
      paddingBottom: node.paddingBottom,
      paddingLeft: node.paddingLeft,
      itemSpacing: node.itemSpacing,
      itemReverseZIndex: node.itemReverseZIndex,
      strokesIncludedInLayout: node.strokesIncludedInLayout,
      clipsContent: node.clipsContent,
    };

    if ('layoutAlign' in node) {
      layout.layoutAlign = (node as unknown as AutoLayoutChildrenMixin).layoutAlign;
    }

    if ('layoutGrow' in node) {
      layout.layoutGrow = (node as unknown as AutoLayoutChildrenMixin).layoutGrow;
    }

    if (node.layoutGrids.length > 0) {
      layout.layoutGrids = node.layoutGrids.map(g => this.mapLayoutGrid(g));
    }

    return layout;
  }

  private mapLayoutGrid(grid: LayoutGrid): LayoutGridProperties {
    const base: LayoutGridProperties = {
      pattern: grid.pattern,
      visible: grid.visible,
      color: grid.color
        ? { r: grid.color.r, g: grid.color.g, b: grid.color.b, a: grid.color.a }
        : undefined,
    };

    if (grid.pattern === 'ROWS' || grid.pattern === 'COLUMNS') {
      return {
        ...base,
        alignment: grid.alignment,
        gutterSize: grid.gutterSize,
        count: grid.count,
        sectionSize: grid.sectionSize,
        offset: grid.offset,
      };
    }

    return {
      ...base,
      sectionSize: grid.sectionSize,
    };
  }

  private mapCorners(node: SceneNode & CornerMixin): CornerProperties {
    const corners: CornerProperties = {};

    const radius = asMixed(node.cornerRadius);
    if (radius !== undefined) {
      corners.cornerRadius = radius as number;
    }
    corners.cornerSmoothing = node.cornerSmoothing;

    if (hasPerCorners(node)) {
      corners.topLeftRadius = node.topLeftRadius;
      corners.topRightRadius = node.topRightRadius;
      corners.bottomLeftRadius = node.bottomLeftRadius;
      corners.bottomRightRadius = node.bottomRightRadius;
    }

    return corners;
  }

  private mapConstraints(node: SceneNode & ConstraintMixin): ConstraintProperties {
    return {
      horizontal: node.constraints.horizontal,
      vertical: node.constraints.vertical,
    };
  }

  private mapTypography(node: TextNode): TypographyProperties {
    const fontSize = asMixedWithDefault(node.fontSize, 0);
    const fontName = asMixedWithDefault(node.fontName, { family: '', style: '' } as FontName);
    const textCase = asMixedWithDefault(node.textCase, 'ORIGINAL' as TextCase);
    const textDecoration = asMixedWithDefault(node.textDecoration, 'NONE' as TextDecoration);
    const letterSpacing = asMixedWithDefault(node.letterSpacing, {
      value: 0,
      unit: 'PIXELS' as const,
    } as LetterSpacing);
    const lineHeight = asMixedWithDefault(node.lineHeight, {
      unit: 'AUTO' as const,
    } as LineHeight);

    const props: TypographyProperties = {
      characters: node.characters,
      fontSize,
      fontName: { family: fontName.family, style: fontName.style },
      textCase,
      textDecoration,
      letterSpacing: { value: letterSpacing.value, unit: letterSpacing.unit },
      lineHeight:
        lineHeight.unit === 'AUTO'
          ? { unit: 'AUTO' }
          : {
              value: (lineHeight as { value: number }).value,
              unit: lineHeight.unit,
            },
      paragraphSpacing: asMixedWithDefault(node.paragraphSpacing, 0),
      textAlignHorizontal: node.textAlignHorizontal,
      textAlignVertical: node.textAlignVertical,
      textAutoResize: node.textAutoResize,
    };

    const hyperlink = asMixed(node.hyperlink);
    if (hyperlink) {
      props.hyperlink = {
        type: (hyperlink as HyperlinkTarget).type,
        value: (hyperlink as HyperlinkTarget).value,
      };
    }

    return props;
  }
}
