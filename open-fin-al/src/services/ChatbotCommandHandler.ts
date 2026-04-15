import { ComponentRegistry } from "../types/ComponentRegistry";
import type { IViewComponent } from "../types/IViewComponent";

export type CommandResult = {
    success: boolean;
    message: string;
    componentId?: string;
};

// A parsed intent pairs a component search query with the mutation to apply.
type ParsedIntent = {
    componentQuery: string;
    apply(component: IViewComponent): string; // returns a human-readable success message
};

type IntentParser = {
    pattern: RegExp;
    parse(matches: RegExpMatchArray): ParsedIntent;
};

// ---------------------------------------------------------------------------
// Intent parsers — tried in order, first match wins.
// Articles ("the", "a", "an") are stripped from component queries before
// searching the registry so "the stock chart" finds "Stock Chart".
// ---------------------------------------------------------------------------

const INTENT_PARSERS: IntentParser[] = [
    // hide [the] <component>
    {
        pattern: /^hide\s+(?:the\s+|an?\s+)?(.+)$/i,
        parse: ([, query]) => ({
            componentQuery: query.trim(),
            apply: (c) => {
                c.setVisible(false);
                return `"${c.label}" is now hidden.`;
            },
        }),
    },

    // show [the] <component>
    {
        pattern: /^show\s+(?:the\s+|an?\s+)?(.+)$/i,
        parse: ([, query]) => ({
            componentQuery: query.trim(),
            apply: (c) => {
                c.setVisible(true);
                return `"${c.label}" is now visible.`;
            },
        }),
    },

    // enable [the] <component>
    {
        pattern: /^enable\s+(?:the\s+|an?\s+)?(.+)$/i,
        parse: ([, query]) => ({
            componentQuery: query.trim(),
            apply: (c) => {
                c.setEnabled(true);
                return `"${c.label}" is now enabled.`;
            },
        }),
    },

    // disable [the] <component>
    {
        pattern: /^disable\s+(?:the\s+|an?\s+)?(.+)$/i,
        parse: ([, query]) => ({
            componentQuery: query.trim(),
            apply: (c) => {
                c.setEnabled(false);
                return `"${c.label}" is now disabled.`;
            },
        }),
    },

    // resize [the] <component> to <W>x<H>  (also accepts "by" and "×")
    {
        pattern: /^resize\s+(?:the\s+|an?\s+)?(.+?)\s+to\s+(\d+)\s*(?:x|by|×)\s*(\d+)$/i,
        parse: ([, query, w, h]) => ({
            componentQuery: query.trim(),
            apply: (c) => {
                c.setWidth(Number(w));
                c.setHeight(Number(h));
                return `"${c.label}" resized to ${w}×${h}.`;
            },
        }),
    },

    // set [the] <component> width to <N>
    {
        pattern: /^set\s+(?:the\s+|an?\s+)?(.+?)\s+width\s+to\s+(\d+)$/i,
        parse: ([, query, n]) => ({
            componentQuery: query.trim(),
            apply: (c) => {
                c.setWidth(Number(n));
                return `"${c.label}" width set to ${n}.`;
            },
        }),
    },

    // set width of [the] <component> to <N>
    {
        pattern: /^set\s+width\s+of\s+(?:the\s+|an?\s+)?(.+?)\s+to\s+(\d+)$/i,
        parse: ([, query, n]) => ({
            componentQuery: query.trim(),
            apply: (c) => {
                c.setWidth(Number(n));
                return `"${c.label}" width set to ${n}.`;
            },
        }),
    },

    // set [the] <component> height to <N>
    {
        pattern: /^set\s+(?:the\s+|an?\s+)?(.+?)\s+height\s+to\s+(\d+)$/i,
        parse: ([, query, n]) => ({
            componentQuery: query.trim(),
            apply: (c) => {
                c.setHeight(Number(n));
                return `"${c.label}" height set to ${n}.`;
            },
        }),
    },

    // set height of [the] <component> to <N>
    {
        pattern: /^set\s+height\s+of\s+(?:the\s+|an?\s+)?(.+?)\s+to\s+(\d+)$/i,
        parse: ([, query, n]) => ({
            componentQuery: query.trim(),
            apply: (c) => {
                c.setHeight(Number(n));
                return `"${c.label}" height set to ${n}.`;
            },
        }),
    },

    // set financial level to <N> on|for [the] <component>
    {
        pattern: /^set\s+financial\s+(?:knowledge\s+)?level\s+to\s+(\d+)\s+(?:on|for)\s+(?:the\s+|an?\s+)?(.+)$/i,
        parse: ([, n, query]) => ({
            componentQuery: query.trim(),
            apply: (c) => {
                c.setFinancialKnowledgeLevel(Number(n));
                return `"${c.label}" financial knowledge level set to ${n}.`;
            },
        }),
    },

    // add tag <tag> to [the] <component>
    {
        pattern: /^add\s+tag\s+(\S+)\s+to\s+(?:the\s+|an?\s+)?(.+)$/i,
        parse: ([, tag, query]) => ({
            componentQuery: query.trim(),
            apply: (c) => {
                c.addTag(tag);
                return `Tag "${tag}" added to "${c.label}".`;
            },
        }),
    },

    // remove tag <tag> from [the] <component>
    {
        pattern: /^remove\s+tag\s+(\S+)\s+from\s+(?:the\s+|an?\s+)?(.+)$/i,
        parse: ([, tag, query]) => ({
            componentQuery: query.trim(),
            apply: (c) => {
                c.removeTag(tag);
                return `Tag "${tag}" removed from "${c.label}".`;
            },
        }),
    },
];

// ---------------------------------------------------------------------------

export class ChatbotCommandHandler {
    private readonly registry: ComponentRegistry;

    constructor(registry: ComponentRegistry = ComponentRegistry.getInstance()) {
        this.registry = registry;
    }

    handle(command: string): CommandResult {
        const trimmed = command.trim();

        for (const { pattern, parse } of INTENT_PARSERS) {
            const matches = trimmed.match(pattern);
            if (!matches) continue;

            const intent = parse(matches);
            return this.resolveAndApply(intent);
        }

        return {
            success: false,
            message: `Command not recognised: "${trimmed}". Try phrases like "hide the stock chart" or "resize the search bar to 400x200".`,
        };
    }

    private resolveAndApply(intent: ParsedIntent): CommandResult {
        const results = this.registry.search(intent.componentQuery);

        if (results.length === 0) {
            return {
                success: false,
                message: `No component found matching "${intent.componentQuery}".`,
            };
        }

        // Prefer an exact label match; fall back to the first result.
        const queryLower = intent.componentQuery.toLowerCase();
        const best =
            results.find(r => r.component.label.toLowerCase() === queryLower) ??
            results[0];

        const successMessage = intent.apply(best.component);

        const ambiguityNote =
            results.length > 1
                ? ` (${results.length - 1} other match${results.length > 2 ? 'es' : ''} ignored)`
                : '';

        return {
            success: true,
            message: successMessage + ambiguityNote,
            componentId: best.id,
        };
    }
}
