import React from "react";
import { ViewComponent } from "../types/ViewComponent";

// The props the HOC injects — every wrapped component gets these
export interface WithViewComponentProps {
    viewConfig: ViewComponent;
}

// The HOC — wraps any .jsx component and enforces ViewComponent type safety
export function withViewComponent<P extends object>(
    WrappedComponent: React.ComponentType<P & WithViewComponentProps>
) {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

    function ViewComponentWrapper(props: P & WithViewComponentProps) {
        const { viewConfig, ...rest } = props;

        // Guard against missing viewConfig (e.g. component rendered without prop)
        if (!viewConfig) return null;

        // Centralized visibility guard — no need to handle this in each .jsx file
        if (!viewConfig.getVisible()) return null;

        return (
            <div
                style={{
                    height: viewConfig.maintainAspectRatio ? viewConfig.getHeight() : "auto",
                    width: viewConfig.maintainAspectRatio ? viewConfig.getWidth() : "100%",
                    pointerEvents: viewConfig.getEnabled() ? "auto" : "none",
                    opacity: viewConfig.getEnabled() ? 1 : 0.5,
                    boxSizing: "border-box",
                }}
            >
                <WrappedComponent
                    {...(rest as P)}
                    viewConfig={viewConfig}
                />
            </div>
        );
    }

    ViewComponentWrapper.displayName = `WithViewComponent(${displayName})`;

    return ViewComponentWrapper;
}
