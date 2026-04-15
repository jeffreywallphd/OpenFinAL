declare module "*.jsx" {
    import React from "react";
    const component: React.ComponentType<any>;
    export default component;
    export { component };
}

/*

This one file covers **every `.jsx` import across your entire project** — no matter how many components you add in the future.


**The full picture of how type safety still works**

Even with the global declaration silencing the import error, your type safety is **not lost** because:

WrappedComponents.ts  ←  still .ts, still typed
      ↓
withViewComponent.tsx ←  still enforces ViewComponent interface
      ↓
Stock.jsx             ←  viewConfig is still typed at point of use

*/