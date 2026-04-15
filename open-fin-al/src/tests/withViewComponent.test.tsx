import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
// NOTE: ViewComponent is a plain mutable class.  The HOC is an unmemorised
// functional component, so any parent re-render will pick up mutations made
// to the same ViewComponent instance.  If the HOC is ever wrapped in
// React.memo, callers will need to pass a new instance (config.clone()) to
// trigger a re-render, since memo uses shallow prop equality.
// Test 6 verifies that the DOM updates correctly when a new config is passed.
import { withViewComponent, WithViewComponentProps } from '../hoc/withViewComponent';
import { ViewComponent } from '../types/ViewComponent';
import { IViewComponent } from '../types/IViewComponent';

// ── Test stub ──────────────────────────────────────────────────────────────────
// A minimal component that accepts the HOC-injected viewConfig prop.
// Keeping it trivial isolates HOC behavior from any real component complexity.
function Stub(_props: WithViewComponentProps): React.ReactElement {
    return <div data-testid="stub-inner">stub</div>;
}
const WrappedStub = withViewComponent(Stub);

// ── Config factory ─────────────────────────────────────────────────────────────
// ViewComponent's constructor only reads the 15 data properties — it never calls
// methods on the config object — so casting a plain data literal to IViewComponent
// is safe here. The factory lets individual tests override only what they care about.
function makeConfig(overrides: Partial<{
    height: number;
    width: number;
    isContainer: boolean;
    resizable: boolean;
    maintainAspectRatio: boolean;
    heightRatio: number;
    widthRatio: number;
    heightWidthRatioMultiplier: number;
    visible: boolean;
    enabled: boolean;
    label: string;
    description: string;
    tags: string[];
    minimumProficiencyRequirements: Record<string, number>;
    requiresInternet: boolean;
}> = {}): ViewComponent {
    return new ViewComponent({
        height: 400,
        width: 600,
        isContainer: false,
        resizable: true,
        maintainAspectRatio: false,
        heightRatio: 9,
        widthRatio: 16,
        heightWidthRatioMultiplier: 1,
        visible: true,
        enabled: true,
        label: 'Test',
        description: 'Test component',
        tags: [],
        minimumProficiencyRequirements: {},
        requiresInternet: false,
        ...overrides,
    } as IViewComponent);
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('withViewComponent HOC', () => {

    // ── Test 1: Visibility toggle ────────────────────────────────────────────
    describe('Test 1 — Visibility toggle', () => {
        it('returns null when visible is false', () => {
            const config = makeConfig({ visible: false });
            const { container } = render(<WrappedStub viewConfig={config} />);
            expect(container.firstChild).toBeNull();
        });

        it('renders the wrapper div and inner stub when visible is true', () => {
            const config = makeConfig({ visible: true });
            const { getByTestId } = render(<WrappedStub viewConfig={config} />);
            expect(getByTestId('stub-inner')).toBeInTheDocument();
        });
    });

    // ── Test 2: Enabled / disabled ───────────────────────────────────────────
    describe('Test 2 — Enabled/disabled behavior', () => {
        it('sets pointer-events:none and opacity:0.5 on the wrapper when disabled', () => {
            const config = makeConfig({ enabled: false });
            const { container } = render(<WrappedStub viewConfig={config} />);
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveStyle({ pointerEvents: 'none', opacity: '0.5' });
        });

        it('sets pointer-events:auto and opacity:1 on the wrapper when enabled', () => {
            const config = makeConfig({ enabled: true });
            const { container } = render(<WrappedStub viewConfig={config} />);
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveStyle({ pointerEvents: 'auto', opacity: '1' });
        });
    });

    // ── Test 3: Height and width passthrough ─────────────────────────────────
    describe('Test 3 — Height and width passthrough', () => {
        it('sets the wrapper div dimensions from ViewComponent values', () => {
            const config = makeConfig({ height: 300, width: 500 });
            const { container } = render(<WrappedStub viewConfig={config} />);
            const wrapper = container.firstChild as HTMLElement;
            // React converts numeric style values to px strings in the DOM
            expect(wrapper).toHaveStyle({ height: '300px', width: '500px' });
        });
    });

    // ── Test 4: Aspect ratio lock (model only) ───────────────────────────────
    // These tests verify that ViewComponent's internal math is correct.
    // They do NOT re-render the HOC, so they only prove the model updates —
    // not that the UI reflects the change.  See Test 6 for UI re-render coverage.
    // calculateRatioMultiplier() = heightRatio / widthRatio = 9/16 = 0.5625
    // setHeight(h): width = h / 0.5625
    // setWidth(w):  height = w * 0.5625
    describe('Test 4 — Aspect ratio lock', () => {
        it('recalculates width after setHeight when maintainAspectRatio is true', () => {
            const config = makeConfig({
                maintainAspectRatio: true,
                heightRatio: 9,
                widthRatio: 16,
            });
            config.setHeight(160);
            expect(config.getHeight()).toBe(160);
            // width = 160 / (9/16) = 160 * (16/9) ≈ 284.44
            expect(config.getWidth()).toBeCloseTo(160 / (9 / 16), 4);
        });

        it('recalculates height after setWidth when maintainAspectRatio is true', () => {
            const config = makeConfig({
                maintainAspectRatio: true,
                heightRatio: 9,
                widthRatio: 16,
            });
            config.setWidth(160);
            expect(config.getWidth()).toBe(160);
            // height = 160 * (9/16) = 160 * 0.5625 = 90
            expect(config.getHeight()).toBe(90);
        });

        it('leaves width unchanged after setHeight when maintainAspectRatio is false', () => {
            const config = makeConfig({ maintainAspectRatio: false, height: 400, width: 600 });
            config.setHeight(200);
            expect(config.getHeight()).toBe(200);
            expect(config.getWidth()).toBe(600);
        });

        it('leaves height unchanged after setWidth when maintainAspectRatio is false', () => {
            const config = makeConfig({ maintainAspectRatio: false, height: 400, width: 600 });
            config.setWidth(300);
            expect(config.getWidth()).toBe(300);
            expect(config.getHeight()).toBe(400);
        });
    });

    // ── Test 6: UI re-render on config change ────────────────────────────────
    // Verifies that when the *caller* passes a new ViewComponent instance the
    // HOC wrapper div actually reflects the updated values in the DOM.
    // This catches the silent-update bug: mutating the same object in place
    // does not re-render React, so callers must clone first (config.clone()).
    describe('Test 6 — UI updates when a new config is passed via rerender', () => {
        it('updates wrapper dimensions in the DOM after rerender with new config', () => {
            const initial = makeConfig({ height: 400, width: 600 });
            const { container, rerender } = render(<WrappedStub viewConfig={initial} />);
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveStyle({ height: '400px', width: '600px' });

            // Clone + mutate to get a new object reference — React detects the change
            const updated = initial.clone();
            updated.setHeight(200);
            updated.setWidth(300);
            rerender(<WrappedStub viewConfig={updated} />);

            expect(wrapper).toHaveStyle({ height: '200px', width: '300px' });
        });

        it('hides the component in the DOM after rerender with visible:false', () => {
            const initial = makeConfig({ visible: true });
            const { container, rerender } = render(<WrappedStub viewConfig={initial} />);
            expect(container.firstChild).not.toBeNull();

            const updated = initial.clone();
            updated.setVisible(false);
            rerender(<WrappedStub viewConfig={updated} />);

            expect(container.firstChild).toBeNull();
        });

        it('applies disabled styles in the DOM after rerender with enabled:false', () => {
            const initial = makeConfig({ enabled: true });
            const { container, rerender } = render(<WrappedStub viewConfig={initial} />);
            expect(container.firstChild as HTMLElement).toHaveStyle({ pointerEvents: 'auto' });

            const updated = initial.clone();
            updated.setEnabled(false);
            rerender(<WrappedStub viewConfig={updated} />);

            expect(container.firstChild as HTMLElement).toHaveStyle({
                pointerEvents: 'none',
                opacity: '0.5',
            });
        });

    });

    // ── Test 5: Type safety ──────────────────────────────────────────────────
    // Each bad call below is annotated with the suppression directive on the
    // immediately preceding line.  If TypeScript no longer raises an error
    // there, ts-jest fails with "Unused suppression directive" — proving the
    // type guard is real.
    describe('Test 5 — Type safety (compile-time enforcement)', () => {
        it('rejects a render with no viewConfig prop at all', () => {
            // Expected TS error:
            //   Property 'viewConfig' is missing in type '{}' but required
            //   in type 'WithViewComponentProps'.
            // @ts-expect-error
            const jsx = <WrappedStub />;
            expect(jsx).toBeDefined();
        });

        it('rejects a plain object literal passed as viewConfig', () => {
            // Expected TS error:
            //   Type '{ height: number; width: number; }' is not assignable
            //   to type 'ViewComponent'.  Missing properties: isContainer,
            //   resizable, ..., getHeight, getWidth, getVisible, ... (and all
            //   other ViewComponent members).
            // @ts-expect-error
            const jsx = <WrappedStub viewConfig={{ height: 400, width: 600 }} />;
            expect(jsx).toBeDefined();
        });
    });
});
