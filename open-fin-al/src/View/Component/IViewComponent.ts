export interface IViewComponent {
    height: number; // for exact height value
    width: number; // for exact width value
    isContainer: boolean; // can the component contain other components
    resizable: boolean;
    maintainAspectRatio: boolean; 
    heightRatio: number; // for dynamic height
    widthRatio: number; // for dynamic width
    heightWidthRatioMultiplier: number; // multiplier to maintain aspect ratio when resizing
    visible: boolean; // does the component start visible or hidden
    enabled: boolean; // is the component usable; allows for visibility but not interaction

    label: string; // for natural language processing search
    description: string; // for natural language processing search
    tags: string[]; // for natural language processing search

    minimumProficiencyRequirements: Map<string, number>; // Map of <requirementLabel, requirementLevel>
    requiresInternet: boolean;

    calculateRatioMultiplier(): number;
}