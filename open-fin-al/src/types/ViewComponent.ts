import type { IViewComponent } from "./IViewComponent";

export class ViewComponent implements IViewComponent {
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

    constructor(config: IViewComponent) {
        this.height = config.height;
        this.width = config.width;
        this.isContainer = config.isContainer;
        this.resizable = config.resizable;
        this.maintainAspectRatio = config.maintainAspectRatio;
        this.heightRatio = config.heightRatio;
        this.widthRatio = config.widthRatio;
        this.heightWidthRatioMultiplier = config.heightWidthRatioMultiplier;
        this.visible = config.visible;
        this.enabled = config.enabled;
        this.label = config.label;
        this.description = config.description;
        this.tags = [...config.tags];
        this.minimumProficiencyRequirements = { ...config.minimumProficiencyRequirements };
        this.requiresInternet = config.requiresInternet;
    }

    calculateRatioMultiplier(): number {
        if (this.widthRatio === 0) return 1;
        return this.heightRatio / this.widthRatio;
    }

    clone(): ViewComponent {
        return new ViewComponent({ ...this });
    }

    getHeight(): number { return this.height; }
    getWidth(): number { return this.width; }
    getVisible(): boolean { return this.visible; }
    getEnabled(): boolean { return this.enabled; }
    getTags(): string[] { return [...this.tags]; }

    setHeight(value: number): void {
        this.height = value;
        if (this.maintainAspectRatio) {
            this.width = value / this.calculateRatioMultiplier();
        }
    }

    setWidth(value: number): void {
        this.width = value;
        if (this.maintainAspectRatio) {
            this.height = value * this.calculateRatioMultiplier();
        }
    }

    setVisible(value: boolean): void { this.visible = value; }
    setEnabled(value: boolean): void { this.enabled = value; }

    addTag(tag: string): void {
        if (!this.tags.includes(tag)) this.tags.push(tag);
    }

    removeTag(tag: string): void {
        this.tags = this.tags.filter(t => t !== tag);
    }
}