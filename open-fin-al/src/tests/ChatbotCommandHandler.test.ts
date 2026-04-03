import { ComponentRegistry } from '../types/ComponentRegistry';
import { ViewComponent } from '../types/ViewComponent';
import { ChatbotCommandHandler } from '../services/ChatbotCommandHandler';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeComponent(overrides: Record<string, unknown> = {}): ViewComponent {
    return new ViewComponent({
        height: 300,
        width: 400,
        isContainer: false,
        resizable: true,
        maintainAspectRatio: false,
        heightRatio: 1,
        widthRatio: 1,
        heightWidthRatioMultiplier: 1,
        visible: true,
        enabled: true,
        label: 'Test Component',
        description: 'A generic test component',
        tags: [],
        minimumProficiencyRequirements: {},
        requiresInternet: false,
        ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
}

// Each test gets a fresh registry + handler so state never leaks between tests.
function makeFixture() {
    // ComponentRegistry is a singleton, so we reach in and reset its internal map.
    const registry = ComponentRegistry.getInstance();
    (registry as any).registry = new Map();
    const handler = new ChatbotCommandHandler(registry);
    return { registry, handler };
}

// ---------------------------------------------------------------------------
// ViewComponent — getFinancialKnowledgeLevel / setFinancialKnowledgeLevel
// ---------------------------------------------------------------------------

describe('ViewComponent financial knowledge level', () => {
    test('defaults to 0 when not set', () => {
        const c = makeComponent();
        expect(c.getFinancialKnowledgeLevel()).toBe(0);
    });

    test('setFinancialKnowledgeLevel stores the value', () => {
        const c = makeComponent();
        c.setFinancialKnowledgeLevel(4);
        expect(c.getFinancialKnowledgeLevel()).toBe(4);
    });

    test('overwrites a previously set level', () => {
        const c = makeComponent();
        c.setFinancialKnowledgeLevel(2);
        c.setFinancialKnowledgeLevel(5);
        expect(c.getFinancialKnowledgeLevel()).toBe(5);
    });

    test('writes into minimumProficiencyRequirements under the "financial" key', () => {
        const c = makeComponent();
        c.setFinancialKnowledgeLevel(3);
        expect(c.minimumProficiencyRequirements['financial']).toBe(3);
    });

    test('reads back a level pre-set in minimumProficiencyRequirements', () => {
        const c = makeComponent({ minimumProficiencyRequirements: { financial: 7 } });
        expect(c.getFinancialKnowledgeLevel()).toBe(7);
    });
});

// ---------------------------------------------------------------------------
// ComponentRegistry
// ---------------------------------------------------------------------------

describe('ComponentRegistry', () => {
    test('register and getById', () => {
        const { registry } = makeFixture();
        const c = makeComponent({ label: 'Stock Chart' });
        registry.register('stock-chart', c);
        expect(registry.getById('stock-chart')).toBe(c);
    });

    test('getById returns undefined for unknown id', () => {
        const { registry } = makeFixture();
        expect(registry.getById('nope')).toBeUndefined();
    });

    test('register throws on duplicate id', () => {
        const { registry } = makeFixture();
        registry.register('dup', makeComponent());
        expect(() => registry.register('dup', makeComponent())).toThrow('dup');
    });

    test('unregister removes a component', () => {
        const { registry } = makeFixture();
        registry.register('temp', makeComponent());
        registry.unregister('temp');
        expect(registry.getById('temp')).toBeUndefined();
    });

    test('search matches by label (case-insensitive)', () => {
        const { registry } = makeFixture();
        registry.register('sc', makeComponent({ label: 'Stock Chart' }));
        const results = registry.search('stock');
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe('sc');
    });

    test('search matches by description', () => {
        const { registry } = makeFixture();
        registry.register('sc', makeComponent({ description: 'Displays OHLC candlestick data' }));
        const results = registry.search('candlestick');
        expect(results).toHaveLength(1);
    });

    test('search matches by tag', () => {
        const { registry } = makeFixture();
        registry.register('sc', makeComponent({ tags: ['charting', 'market-data'] }));
        const results = registry.search('market-data');
        expect(results).toHaveLength(1);
    });

    test('search returns multiple matches', () => {
        const { registry } = makeFixture();
        registry.register('a', makeComponent({ label: 'Stock Chart' }));
        registry.register('b', makeComponent({ label: 'Stock Quote Panel' }));
        registry.register('c', makeComponent({ label: 'News Feed' }));
        const results = registry.search('stock');
        expect(results).toHaveLength(2);
    });

    test('search returns empty array when nothing matches', () => {
        const { registry } = makeFixture();
        registry.register('a', makeComponent({ label: 'Stock Chart' }));
        expect(registry.search('xyz-no-match')).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// ChatbotCommandHandler — intent parsing & dispatch
// ---------------------------------------------------------------------------

describe('ChatbotCommandHandler', () => {
    describe('hide / show', () => {
        test('hide the stock chart sets visible to false', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Stock Chart', visible: true });
            registry.register('stock-chart', c);

            const result = handler.handle('hide the stock chart');
            expect(result.success).toBe(true);
            expect(c.getVisible()).toBe(false);
            expect(result.componentId).toBe('stock-chart');
        });

        test('show the stock chart sets visible to true', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Stock Chart', visible: false });
            registry.register('stock-chart', c);

            const result = handler.handle('show the stock chart');
            expect(result.success).toBe(true);
            expect(c.getVisible()).toBe(true);
        });

        test('hide works without article', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Stock Chart', visible: true });
            registry.register('sc', c);

            expect(handler.handle('hide stock chart').success).toBe(true);
            expect(c.getVisible()).toBe(false);
        });
    });

    describe('enable / disable', () => {
        test('disable the search bar sets enabled to false', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Ticker Search Bar', enabled: true });
            registry.register('ticker-search', c);

            const result = handler.handle('disable the ticker search bar');
            expect(result.success).toBe(true);
            expect(c.getEnabled()).toBe(false);
        });

        test('enable the search bar sets enabled to true', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Ticker Search Bar', enabled: false });
            registry.register('ticker-search', c);

            const result = handler.handle('enable the ticker search bar');
            expect(result.success).toBe(true);
            expect(c.getEnabled()).toBe(true);
        });
    });

    describe('resize', () => {
        test('resize the search bar to 400x200', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Search Bar' });
            registry.register('search-bar', c);

            const result = handler.handle('resize the search bar to 400x200');
            expect(result.success).toBe(true);
            expect(c.getWidth()).toBe(400);
            expect(c.getHeight()).toBe(200);
        });

        test('resize accepts "by" as the separator', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Chart' });
            registry.register('chart', c);

            handler.handle('resize the chart to 800 by 600');
            expect(c.getWidth()).toBe(800);
            expect(c.getHeight()).toBe(600);
        });
    });

    describe('set width / height', () => {
        test('set the side panel width to 300', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Side Panel' });
            registry.register('side-panel', c);

            const result = handler.handle('set the side panel width to 300');
            expect(result.success).toBe(true);
            expect(c.getWidth()).toBe(300);
        });

        test('set width of the side panel to 300', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Side Panel' });
            registry.register('side-panel', c);

            handler.handle('set width of the side panel to 300');
            expect(c.getWidth()).toBe(300);
        });

        test('set the chart height to 500', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Chart' });
            registry.register('chart', c);

            handler.handle('set the chart height to 500');
            expect(c.getHeight()).toBe(500);
        });

        test('set height of the chart to 500', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Chart' });
            registry.register('chart', c);

            handler.handle('set height of the chart to 500');
            expect(c.getHeight()).toBe(500);
        });
    });

    describe('financial knowledge level', () => {
        test('set financial level to 3 on the side panel', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Side Panel' });
            registry.register('side-panel', c);

            const result = handler.handle('set financial level to 3 on the side panel');
            expect(result.success).toBe(true);
            expect(c.getFinancialKnowledgeLevel()).toBe(3);
        });

        test('set financial level to 5 for the side panel', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Side Panel' });
            registry.register('side-panel', c);

            handler.handle('set financial level to 5 for the side panel');
            expect(c.getFinancialKnowledgeLevel()).toBe(5);
        });

        test('set financial knowledge level variant', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Side Panel' });
            registry.register('side-panel', c);

            handler.handle('set financial knowledge level to 2 on the side panel');
            expect(c.getFinancialKnowledgeLevel()).toBe(2);
        });
    });

    describe('tags', () => {
        test('add tag advanced to the chart', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Chart', tags: [] });
            registry.register('chart', c);

            const result = handler.handle('add tag advanced to the chart');
            expect(result.success).toBe(true);
            expect(c.getTags()).toContain('advanced');
        });

        test('remove tag beta from the chart', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Chart', tags: ['beta', 'preview'] });
            registry.register('chart', c);

            const result = handler.handle('remove tag beta from the chart');
            expect(result.success).toBe(true);
            expect(c.getTags()).not.toContain('beta');
            expect(c.getTags()).toContain('preview');
        });
    });

    describe('error cases', () => {
        test('returns failure when no component matches', () => {
            const { handler } = makeFixture();
            const result = handler.handle('hide the flux capacitor');
            expect(result.success).toBe(false);
            expect(result.message).toMatch(/no component found/i);
        });

        test('returns failure for an unrecognised command', () => {
            const { registry, handler } = makeFixture();
            registry.register('chart', makeComponent({ label: 'Chart' }));

            const result = handler.handle('do something weird with the chart');
            expect(result.success).toBe(false);
            expect(result.message).toMatch(/not recognised/i);
        });

        test('handles extra whitespace in commands', () => {
            const { registry, handler } = makeFixture();
            const c = makeComponent({ label: 'Chart', visible: true });
            registry.register('chart', c);

            const result = handler.handle('  hide  the chart  ');
            expect(result.success).toBe(true);
            expect(c.getVisible()).toBe(false);
        });
    });

    describe('ambiguity resolution', () => {
        test('prefers exact label match over fuzzy match', () => {
            const { registry, handler } = makeFixture();
            const exact = makeComponent({ label: 'Chart' });
            const fuzzy = makeComponent({ label: 'Chart Overlay Panel' });
            registry.register('exact', exact);
            registry.register('fuzzy', fuzzy);

            const result = handler.handle('hide the chart');
            expect(result.success).toBe(true);
            expect(result.componentId).toBe('exact');
        });

        test('notes ambiguity in the result message when multiple components match', () => {
            const { registry, handler } = makeFixture();
            registry.register('a', makeComponent({ label: 'Stock Chart' }));
            registry.register('b', makeComponent({ label: 'Stock Quote' }));

            const result = handler.handle('hide the stock');
            expect(result.success).toBe(true);
            expect(result.message).toMatch(/ignored/i);
        });
    });
});
