import type { IViewComponent } from "./IViewComponent";

export class ComponentRegistry {
    private static instance: ComponentRegistry;
    private registry: Map<string, IViewComponent> = new Map();

    private constructor() {}

    static getInstance(): ComponentRegistry {
        if (!ComponentRegistry.instance) {
            ComponentRegistry.instance = new ComponentRegistry();
        }
        return ComponentRegistry.instance;
    }

    register(id: string, component: IViewComponent): void {
        if (this.registry.has(id)) {
            throw new Error(`Component with id "${id}" is already registered.`);
        }
        this.registry.set(id, component);
    }

    unregister(id: string): void {
        this.registry.delete(id);
    }

    getById(id: string): IViewComponent | undefined {
        return this.registry.get(id);
    }

    getAll(): ReadonlyMap<string, IViewComponent> {
        return this.registry;
    }

    // Case-insensitive search across label, description, and tags.
    // Returns all entries whose label, description, or any tag contains the query.
    search(query: string): Array<{ id: string; component: IViewComponent }> {
        const normalized = query.toLowerCase();
        const results: Array<{ id: string; component: IViewComponent }> = [];

        for (const [id, component] of this.registry) {
            const matchesLabel = component.label.toLowerCase().includes(normalized);
            const matchesDescription = component.description.toLowerCase().includes(normalized);
            const matchesTags = component.tags.some(tag => tag.toLowerCase().includes(normalized));

            if (matchesLabel || matchesDescription || matchesTags) {
                results.push({ id, component });
            }
        }

        return results;
    }
}
