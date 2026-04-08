import React, { useEffect, useRef, useState } from "react";
import { withViewComponent, WithViewComponentProps } from "../../../hoc/withViewComponent";
import { PowerPoint } from "../../LearningModule/Slideshow/PowerPoint.jsx";

interface PowerPointInnerProps extends WithViewComponentProps {
    pptxPath: string;
}

function PowerPointInner({ pptxPath, viewConfig }: PowerPointInnerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [availableWidth, setAvailableWidth] = useState(0);

    useEffect(() => {
        const observer = new ResizeObserver(() => {
            if (containerRef.current) {
                setAvailableWidth(containerRef.current.offsetWidth);
            }
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const multiplier = Math.floor(availableWidth / viewConfig.widthRatio);
    const width = multiplier * viewConfig.widthRatio;
    const height = multiplier * viewConfig.heightRatio;

    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
            {multiplier > 0 && (
                <PowerPoint pptxPath={pptxPath} width={width} height={height} />
            )}
        </div>
    );
}

export const PowerPointComponent = withViewComponent(PowerPointInner);