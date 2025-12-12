import React, { Component } from "react";
import { IViewComponent } from "../IViewComponent";
import { PowerPoint } from "../../LearningModule/Slideshow/PowerPoint.jsx";

interface PowerPointComponentState {
  availableWidth: number;
}

export class PowerPointComponent extends Component<{}, PowerPointComponentState> implements IViewComponent {
    height: number = null;
    width: number = null;
    isContainer: boolean = false;
    resizable: boolean = true;
    maintainAspectRatio: boolean = true;
    widthRatio: number = 16;
    heightRatio: number = 9;
    heightWidthRatioMultiplier: number = 56;
    visible: boolean = true;
    enabled: boolean = true;
    label: string = "PowerPoint Learning Module";
    description: string = "Component for displaying PowerPoint presentations";
    tags: string[] = ["PowerPoint", "Presentation", "Slideshow", "Learning Module"];
    minimumProficiencyRequirements: Map<string, number> = null;
    requiresInternet: boolean = true;

    containerRef: React.RefObject<HTMLDivElement>;
    observer: ResizeObserver | null = null;
    pptxPath: string = "";
    
    constructor(props: any = {}) {
        super(props);
        this.containerRef = React.createRef();
        this.state = {
            availableWidth: 0
        };

        this.pptxPath = props['pptxPath'] || "";

        this.calculateRatioMultiplier = this.calculateRatioMultiplier.bind(this);
    }

    componentDidMount() {
        this.observer = new ResizeObserver(() => {
            if (this.containerRef.current) {
                this.setState({
                    availableWidth: this.containerRef.current.offsetWidth,
                });
            }
        });

        if (this.containerRef.current) {
            this.observer.observe(this.containerRef.current);
        }
    }

    componentWillUnmount() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    calculateRatioMultiplier(): number {
        this.heightWidthRatioMultiplier = Math.floor(this.state.availableWidth / this.widthRatio);

        this.width = this.heightWidthRatioMultiplier * this.widthRatio;
        this.height = this.heightWidthRatioMultiplier * this.heightRatio;

        return this.heightWidthRatioMultiplier;
    }

    render(): React.ReactNode {
        const multiplier = this.calculateRatioMultiplier();
        const ready = multiplier > 0 && this.width > 0 && this.height > 0;

        return (
            <div ref={this.containerRef}>
                {ready && (
                    <PowerPoint pptxPath={this.pptxPath} width={this.width} height={this.height} />
                )}
            </div>           
        );
    }
}