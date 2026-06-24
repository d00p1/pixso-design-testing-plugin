import { describe, it, expect } from 'vitest';

function roundTrip<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

describe('DesignProperties', () => {
  it('serializes a full tree round-trip', () => {
    const props = {
      layout: {
        mode: 'VERTICAL' as const,
        wrap: 'NO_WRAP' as const,
        primaryAxisSizingMode: 'FIXED' as const,
        counterAxisSizingMode: 'FIXED' as const,
        primaryAxisAlignItems: 'MIN' as const,
        counterAxisAlignItems: 'MIN' as const,
        paddingTop: 16,
        paddingRight: 16,
        paddingBottom: 16,
        paddingLeft: 16,
        itemSpacing: 8,
        itemReverseZIndex: false,
        strokesIncludedInLayout: false,
        clipsContent: true,
        layoutAlign: 'MIN' as const,
        layoutGrow: 0,
        layoutGrids: [
          {
            pattern: 'COLUMNS' as const,
            alignment: 'STRETCH' as const,
            gutterSize: 20,
            count: 12,
            sectionSize: 80,
            visible: true,
          },
        ],
      },
      fills: [
        {
          type: 'SOLID' as const,
          color: { r: 1, g: 1, b: 1 },
          opacity: 1,
          visible: true,
        },
      ],
      strokes: [
        {
          type: 'SOLID' as const,
          color: { r: 0, g: 0, b: 0 },
          weight: 2,
          align: 'INSIDE' as const,
          opacity: 1,
          visible: true,
          join: 'ROUND' as const,
          dashPattern: [4, 4],
        },
      ],
      effects: [
        {
          type: 'DROP_SHADOW' as const,
          visible: true,
          radius: 8,
          color: { r: 0, g: 0, b: 0, a: 0.25 },
          offset: { x: 0, y: 4 },
          spread: 0,
          blendMode: 'NORMAL',
        },
      ],
      corners: {
        cornerRadius: 8,
        cornerSmoothing: 0.6,
        topLeftRadius: 8,
        topRightRadius: 8,
        bottomLeftRadius: 0,
        bottomRightRadius: 0,
      },
      opacity: 1,
      blendMode: 'PASS_THROUGH',
      visible: true,
      constraints: {
        horizontal: 'STRETCH' as const,
        vertical: 'MAX' as const,
      },
      children: [
        {
          fills: [],
          strokes: [],
          effects: [],
          opacity: 1,
          blendMode: 'NORMAL',
          visible: true,
          typography: {
            characters: 'Hello World',
            fontSize: 16,
            fontName: { family: 'Inter', style: 'Bold' },
            textCase: 'ORIGINAL' as const,
            textDecoration: 'NONE' as const,
            letterSpacing: { value: 0, unit: 'PIXELS' as const },
            lineHeight: { value: 24, unit: 'PIXELS' as const },
            paragraphSpacing: 0,
            textAlignHorizontal: 'LEFT' as const,
            textAlignVertical: 'TOP' as const,
            textAutoResize: 'HEIGHT' as const,
          },
          constraints: {
            horizontal: 'STRETCH' as const,
            vertical: 'MIN' as const,
          },
        },
      ],
    };

    const json = roundTrip(props);

    expect(json.layout?.mode).toBe('VERTICAL');
    expect(json.layout?.paddingTop).toBe(16);
    expect(json.layout?.layoutAlign).toBe('MIN');
    expect(json.layout?.layoutGrids?.[0].pattern).toBe('COLUMNS');
    expect(json.layout?.layoutGrids?.[0].count).toBe(12);
    expect(json.fills[0].type).toBe('SOLID');
    expect(json.fills[0].color).toEqual({ r: 1, g: 1, b: 1 });
    expect(json.strokes[0].weight).toBe(2);
    expect(json.strokes[0].dashPattern).toEqual([4, 4]);
    expect(json.effects[0].type).toBe('DROP_SHADOW');
    expect(json.effects[0].color?.a).toBe(0.25);
    expect(json.corners?.cornerRadius).toBe(8);
    expect(json.corners?.bottomLeftRadius).toBe(0);
    expect(json.constraints?.horizontal).toBe('STRETCH');
    expect(json.children?.[0].typography?.characters).toBe('Hello World');
    expect(json.children?.[0].typography?.fontSize).toBe(16);
    expect(json.children?.[0].typography?.fontName.family).toBe('Inter');
    expect(json.children?.[0].typography?.lineHeight.unit).toBe('PIXELS');
    expect(json.children?.[0].typography?.textAlignHorizontal).toBe('LEFT');
    expect(json.children?.[0].constraints?.horizontal).toBe('STRETCH');
  });

  it('handles minimal properties', () => {
    const minimal = {
      fills: [],
      strokes: [],
      effects: [],
      opacity: 1,
      blendMode: 'NORMAL',
      visible: true,
    };

    const json = roundTrip(minimal);

    expect(json.layout).toBeUndefined();
    expect(json.corners).toBeUndefined();
    expect(json.typography).toBeUndefined();
    expect(json.constraints).toBeUndefined();
    expect(json.children).toBeUndefined();
    expect(json.fills).toEqual([]);
    expect(json.opacity).toBe(1);
  });

  it('handles AUTO lineHeight', () => {
    const text = {
      characters: 'Auto',
      fontSize: 14,
      fontName: { family: 'Inter', style: 'Regular' },
      textCase: 'ORIGINAL' as const,
      textDecoration: 'NONE' as const,
      letterSpacing: { value: 0, unit: 'PIXELS' as const },
      lineHeight: { unit: 'AUTO' as const },
      paragraphSpacing: 0,
      textAlignHorizontal: 'LEFT' as const,
      textAlignVertical: 'TOP' as const,
      textAutoResize: 'NONE' as const,
    };

    const json = roundTrip(text);

    expect(json.lineHeight.unit).toBe('AUTO');
    expect(json.lineHeight.value).toBeUndefined();
  });

  it('handles gradient fills', () => {
    const gradient = {
      type: 'GRADIENT_LINEAR' as const,
      visible: true,
      gradientStops: [
        { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },
        { position: 1, color: { r: 0, g: 0, b: 1, a: 0.5 } },
      ],
    };

    const json = roundTrip(gradient);
    expect(json.type).toBe('GRADIENT_LINEAR');
    expect(json.gradientStops).toHaveLength(2);
    expect(json.gradientStops[0].color.a).toBe(1);
  });

  it('handles inner shadow effect', () => {
    const effect = {
      type: 'INNER_SHADOW' as const,
      visible: true,
      radius: 4,
      color: { r: 0, g: 0, b: 0, a: 0.5 },
      offset: { x: 0, y: 2 },
      blendMode: 'MULTIPLY' as const,
    };

    const json = roundTrip(effect);
    expect(json.type).toBe('INNER_SHADOW');
    expect(json.offset?.y).toBe(2);
    expect(json.blendMode).toBe('MULTIPLY');
  });

  it('handles grid layout grid', () => {
    const grid = {
      pattern: 'GRID' as const,
      sectionSize: 8,
      visible: false,
    };

    const json = roundTrip(grid);
    expect(json.pattern).toBe('GRID');
    expect(json.sectionSize).toBe(8);
    expect(json.count).toBeUndefined();
  });
});
