# Creating a New Component in OpenFinAL

All UI components in OpenFinAL are wrapped with the `withViewComponent` HOC. This gives every component:

- Visibility control (`visible: false` hides it without removing it from the tree)
- Enabled/disabled state (grays out and blocks interaction)
- Automatic fixed dimensions for aspect-ratio-sensitive components (charts, slideshows)
- Auto-sizing (`height: auto`, `width: 100%`) for content-flow components (lists, forms, rows)
- Registration in the `ComponentRegistry` so the AI chatbot can find and mutate it by natural language

There are two component types:

| Type | File extension | When to use |
|---|---|---|
| JSX component | `.jsx` | Standard React component, no TypeScript prop enforcement |
| TSX component | `.tsx` | When you need TypeScript interface checking on props |

---

## Part 1: Creating a JSX Component

### Step 1 — Create the component file

Place the file in the appropriate subdirectory under `open-fin-al/src/View/`.

**Example:** `open-fin-al/src/View/Dashboard/MyWidget.jsx`

```jsx
import React from "react";

// The component receives viewConfig automatically from the HOC wrapper.
// You do not need to use viewConfig inside the component unless you need
// to read dimension or ratio values (e.g. for canvas sizing).
export function MyWidget({ viewConfig, someOtherProp }) {
    return (
        <div className="my-widget">
            <p>{someOtherProp}</p>
        </div>
    );
}
```

> **Note:** Do not call `withViewComponent` inside this file if this component will be exported from `WrappedComponents.ts`. Doing so creates a circular dependency. See the circular dependency warning below.

---

### Step 2 — Add to `WrappedComponents.ts`

Open `open-fin-al/src/hoc/WrappedComponents.ts` and add an import and a wrapped export under the appropriate section comment.

```ts
// Dashboard
import { MyWidget } from "../View/Dashboard/MyWidget";

export const WrappedMyWidget = withViewComponent(MyWidget);
```

---

### Step 3 — Register in `registerComponents.ts`

Open `open-fin-al/src/hoc/registerComponents.ts` and add an entry to the `componentConfigs` array. This registers the component in the `ComponentRegistry` so the AI chatbot can find it.

```ts
{
    id: "my-widget",
    config: {
        label: "My Widget",
        description: "Short description of what the widget does — used by AI search",
        tags: ["widget", "dashboard", "relevant-keyword"],
        height: 200,
        width: 400,
        isContainer: false,
        resizable: true,
        maintainAspectRatio: false,   // true = fixed pixel dims; false = auto/100%
        widthRatio: 2,
        heightRatio: 1,
        heightWidthRatioMultiplier: 0,
        visible: true,
        enabled: true,
        minimumProficiencyRequirements: {},
        requiresInternet: false,
    },
},
```

**`maintainAspectRatio` guide:**
- `true` — the HOC sets explicit `height` and `width` in pixels. Use this for charts, slideshows, and any component where pixel dimensions matter.
- `false` — the HOC sets `height: "auto"` and `width: "100%"`. Use this for lists, rows, forms, and anything that should flow with its content.

---

### Step 4 — Use the wrapped component

Import the wrapped version from `WrappedComponents.ts` in any page file that is **not itself exported from `WrappedComponents.ts`**.

```jsx
import { WrappedMyWidget } from "../hoc/WrappedComponents";
import { useMemo } from "react";
import { ViewComponent } from "../types/ViewComponent";

function SomePage() {
    const myWidgetConfig = useMemo(() => new ViewComponent({
        height: 200, width: 400, isContainer: false, resizable: true,
        maintainAspectRatio: false, widthRatio: 2, heightRatio: 1,
        heightWidthRatioMultiplier: 0, visible: true, enabled: true,
        label: "My Widget", description: "...",
        tags: ["widget"], minimumProficiencyRequirements: {}, requiresInternet: false,
    }), []);

    return <WrappedMyWidget someOtherProp="hello" viewConfig={myWidgetConfig} />;
}
```

> Use `useMemo` for the config in functional components so a new `ViewComponent` instance is not created on every render. For class components, define the config as a class property instead (see the circular dependency section below).

---

## Part 2: Creating a TSX Component

TSX components work exactly the same way as JSX, but you define a TypeScript interface for the props. This ensures callers pass the correct props at compile time.

### Step 1 — Create the component file

Place it under `open-fin-al/src/View/Component/<Section>/` for sub-components, or directly in `open-fin-al/src/View/<Section>/` for page-level components.

**Example:** `open-fin-al/src/View/Component/Dashboard/MyChart.tsx`

```tsx
import React from "react";
import { withViewComponent, WithViewComponentProps } from "../../../hoc/withViewComponent";

// 1. Declare your own props and extend WithViewComponentProps.
//    WithViewComponentProps contributes: viewConfig: ViewComponent
interface MyChartProps extends WithViewComponentProps {
    data: number[];
    label: string;
}

// 2. Write the inner component (not exported directly).
function MyChartInner({ data, label, viewConfig }: MyChartProps) {
    return (
        <div>
            <h4>{label}</h4>
            {/* use data to render chart */}
        </div>
    );
}

// 3. Export the wrapped version.
export const MyChart = withViewComponent(MyChartInner);
```

> The inner function is **not** exported. Only the wrapped export is public. This prevents accidental use of the unwrapped version.

---

### Step 2 — Add to `WrappedComponents.ts`

```ts
// Dashboard
import { MyChart } from "../View/Component/Dashboard/MyChart";

export const WrappedMyChart = withViewComponent(MyChart);
```

Wait — `MyChart` is already wrapped inside its `.tsx` file. **Do not double-wrap it.** Instead, just re-export it with the `Wrapped` naming convention for consistency:

```ts
// Dashboard
export { MyChart as WrappedMyChart } from "../View/Component/Dashboard/MyChart";
```

Or skip `WrappedComponents.ts` entirely for TSX components and import directly from the source file:

```tsx
import { MyChart } from "../View/Component/Dashboard/MyChart";
```

---

### Step 3 — Register in `registerComponents.ts`

Same as JSX — add an entry to `componentConfigs` in `open-fin-al/src/hoc/registerComponents.ts`.

```ts
{
    id: "my-chart",
    config: {
        label: "My Chart",
        description: "Displays data as a chart",
        tags: ["chart", "dashboard", "data"],
        height: 300,
        width: 700,
        isContainer: false,
        resizable: true,
        maintainAspectRatio: true,
        widthRatio: 16,
        heightRatio: 9,
        heightWidthRatioMultiplier: 0,
        visible: true,
        enabled: true,
        minimumProficiencyRequirements: {},
        requiresInternet: false,
    },
},
```

---

### Step 4 — Use the component

```tsx
import { MyChart } from "../View/Component/Dashboard/MyChart";
import { useMemo } from "react";
import { ViewComponent } from "../types/ViewComponent";

function SomePage() {
    const chartConfig = useMemo(() => new ViewComponent({
        height: 300, width: 700, isContainer: false, resizable: true,
        maintainAspectRatio: true, widthRatio: 16, heightRatio: 9,
        heightWidthRatioMultiplier: 0, visible: true, enabled: true,
        label: "My Chart", description: "...",
        tags: ["chart"], minimumProficiencyRequirements: {}, requiresInternet: false,
    }), []);

    return <MyChart data={[1, 2, 3]} label="Revenue" viewConfig={chartConfig} />;
}
```

TypeScript will error at compile time if you forget `data`, `label`, or `viewConfig`, or if you pass the wrong type.

---

## Circular Dependency Warning

**Rule:** Any file that is exported from `WrappedComponents.ts` must NOT import from `WrappedComponents.ts`.

If a page-level component (e.g. `Home.jsx`, `Settings.jsx`) is listed in `WrappedComponents.ts` AND also needs to render a wrapped sub-component, it cannot use `WrappedComponents.ts` as the import source. Instead, wrap locally inside that file:

```jsx
// At the top of Home.jsx — wrap locally instead of importing from WrappedComponents
import { withViewComponent } from "../hoc/withViewComponent";
import { NewsBrowser } from "./News/Browser";

const WrappedNewsBrowser = withViewComponent(NewsBrowser);
```

For class components that cannot use `useMemo`, define the config as a class property:

```jsx
class Home extends Component {
    newsBrowserConfig = new ViewComponent({
        height: 300, width: 400, isContainer: false, resizable: true,
        maintainAspectRatio: false, widthRatio: 4, heightRatio: 3,
        heightWidthRatioMultiplier: 0, visible: true, enabled: true,
        label: "News Browser", description: "...",
        tags: ["news"], minimumProficiencyRequirements: {}, requiresInternet: true,
    });

    render() {
        return <WrappedNewsBrowser viewConfig={this.newsBrowserConfig} />;
    }
}
```

---

## Summary Checklist

### JSX component
- [ ] Create `open-fin-al/src/View/<Section>/MyComponent.jsx` and export a named function
- [ ] Add import + `withViewComponent` export to `open-fin-al/src/hoc/WrappedComponents.ts`
- [ ] Add a config entry to `open-fin-al/src/hoc/registerComponents.ts`
- [ ] Use `WrappedMyComponent` with a `viewConfig` prop at the call site

### TSX component
- [ ] Create `open-fin-al/src/View/Component/<Section>/MyComponent.tsx`
- [ ] Define `interface MyComponentProps extends WithViewComponentProps { ... }`
- [ ] Write the inner function (unexported), call `withViewComponent(Inner)` and export the result
- [ ] Add a config entry to `open-fin-al/src/hoc/registerComponents.ts`
- [ ] Use the exported component directly with a `viewConfig` prop at the call site

### Both
- [ ] Set `maintainAspectRatio: true` only for components that need fixed pixel dimensions (charts, slideshows)
- [ ] Never import from `WrappedComponents.ts` inside a file that is itself exported from `WrappedComponents.ts`
