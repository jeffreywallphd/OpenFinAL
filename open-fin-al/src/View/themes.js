const THEMES = {
    default: {
        label: "Default",
        light: {
            primary: "#2B388F",
            primaryHover: "#5A67D8",
            secondary: "#00878E",
            tertiary: "#62C0C2",
            background: "#FFFFFF",
            backgroundHighlightLight: "#F0F0F0",
            backgroundHighlight: "#CCCCCC",
            accent: "#27A2CC",
            highlight: "#FDCB50",
            textColor: "#FFFFFF",
            textColorLight: "#FFFFFF",
            textColorDark: "#000000",
            textColorM: "#888888",
            textColorMDark: "#333333",
            textColorMLight: "#CCCCCC",
        },
        dark: {
            primary: "#6674f1",
            primaryHover: "#6977f7",
            secondary: "#516a91",
            tertiary: "#4a5568",
            background: "#282828",
            backgroundHighlightLight: "#202020",
            backgroundHighlight: "#181818",
            accent: "#4a5568",
            highlight: "#ecc94b",
            textColor: "#EEEEEE",
            textColorLight: "#555555",
            textColorDark: "#DDDDDD",
            textColorM: "#999999",
            textColorMDark: "#BBBBBB",
            textColorMLight: "#777777",
        },
    },
    ocean: {
        label: "Ocean",
        light: {
            primary: "#0077B6",
            primaryHover: "#0096C7",
            secondary: "#00B4D8",
            tertiary: "#90E0EF",
            background: "#F0F8FF",
            backgroundHighlightLight: "#E0F4FF",
            backgroundHighlight: "#ADE8F4",
            accent: "#0096C7",
            highlight: "#FFD166",
            textColor: "#FFFFFF",
            textColorLight: "#FFFFFF",
            textColorDark: "#03045E",
            textColorM: "#555555",
            textColorMDark: "#222222",
            textColorMLight: "#AAAAAA",
        },
        dark: {
            primary: "#0096C7",
            primaryHover: "#00B4D8",
            secondary: "#0077B6",
            tertiary: "#023E8A",
            background: "#03045E",
            backgroundHighlightLight: "#050A6E",
            backgroundHighlight: "#0A1172",
            accent: "#00B4D8",
            highlight: "#FFD166",
            textColor: "#EEEEEE",
            textColorLight: "#555555",
            textColorDark: "#CAF0F8",
            textColorM: "#999999",
            textColorMDark: "#BBBBBB",
            textColorMLight: "#777777",
        },
    },
    forest: {
        label: "Forest",
        light: {
            primary: "#2D6A4F",
            primaryHover: "#40916C",
            secondary: "#52B788",
            tertiary: "#95D5B2",
            background: "#F1FAF5",
            backgroundHighlightLight: "#D8F3DC",
            backgroundHighlight: "#B7E4C7",
            accent: "#40916C",
            highlight: "#F4A261",
            textColor: "#FFFFFF",
            textColorLight: "#FFFFFF",
            textColorDark: "#1B4332",
            textColorM: "#555555",
            textColorMDark: "#222222",
            textColorMLight: "#AAAAAA",
        },
        dark: {
            primary: "#52B788",
            primaryHover: "#74C69D",
            secondary: "#40916C",
            tertiary: "#2D6A4F",
            background: "#081C15",
            backgroundHighlightLight: "#0D2B1E",
            backgroundHighlight: "#1B4332",
            accent: "#74C69D",
            highlight: "#F4A261",
            textColor: "#EEEEEE",
            textColorLight: "#555555",
            textColorDark: "#D8F3DC",
            textColorM: "#999999",
            textColorMDark: "#BBBBBB",
            textColorMLight: "#777777",
        },
    },
    sunset: {
        label: "Sunset",
        light: {
            primary: "#E63946",
            primaryHover: "#FF6B6B",
            secondary: "#F4A261",
            tertiary: "#FFD166",
            background: "#FFF8F0",
            backgroundHighlightLight: "#FFE8D6",
            backgroundHighlight: "#FFCBA4",
            accent: "#E76F51",
            highlight: "#FFD166",
            textColor: "#FFFFFF",
            textColorLight: "#FFFFFF",
            textColorDark: "#3D0000",
            textColorM: "#666666",
            textColorMDark: "#333333",
            textColorMLight: "#BBBBBB",
        },
        dark: {
            primary: "#FF6B6B",
            primaryHover: "#FF8E8E",
            secondary: "#F4A261",
            tertiary: "#6B2737",
            background: "#1A0A0A",
            backgroundHighlightLight: "#2D1010",
            backgroundHighlight: "#3D1515",
            accent: "#F4A261",
            highlight: "#FFD166",
            textColor: "#EEEEEE",
            textColorLight: "#555555",
            textColorDark: "#FFE8D6",
            textColorM: "#999999",
            textColorMDark: "#BBBBBB",
            textColorMLight: "#777777",
        },
    },
    midnight: {
        label: "Midnight",
        light: {
            primary: "#7B2FBE",
            primaryHover: "#9D4EDD",
            secondary: "#5A189A",
            tertiary: "#E0AAFF",
            background: "#FAF5FF",
            backgroundHighlightLight: "#F3E8FF",
            backgroundHighlight: "#E9D5FF",
            accent: "#9D4EDD",
            highlight: "#FFD60A",
            textColor: "#FFFFFF",
            textColorLight: "#FFFFFF",
            textColorDark: "#3C096C",
            textColorM: "#666666",
            textColorMDark: "#333333",
            textColorMLight: "#BBBBBB",
        },
        dark: {
            primary: "#9D4EDD",
            primaryHover: "#C77DFF",
            secondary: "#7B2FBE",
            tertiary: "#3C096C",
            background: "#10002B",
            backgroundHighlightLight: "#1A0036",
            backgroundHighlight: "#240046",
            accent: "#C77DFF",
            highlight: "#FFD60A",
            textColor: "#EEEEEE",
            textColorLight: "#555555",
            textColorDark: "#E0AAFF",
            textColorM: "#999999",
            textColorMDark: "#BBBBBB",
            textColorMLight: "#666666",
        },
    },
    solarized: {
        label: "Solarized",
        light: {
            primary: "#268BD2",
            primaryHover: "#2AA198",
            secondary: "#859900",
            tertiary: "#B58900",
            background: "#FDF6E3",
            backgroundHighlightLight: "#EEE8D5",
            backgroundHighlight: "#D5CBAB",
            accent: "#268BD2",
            highlight: "#B58900",
            textColor: "#FDF6E3",
            textColorLight: "#FDF6E3",
            textColorDark: "#073642",
            textColorM: "#657B83",
            textColorMDark: "#586E75",
            textColorMLight: "#93A1A1",
        },
        dark: {
            primary: "#268BD2",
            primaryHover: "#2AA198",
            secondary: "#859900",
            tertiary: "#073642",
            background: "#002B36",
            backgroundHighlightLight: "#073642",
            backgroundHighlight: "#0D4A58",
            accent: "#2AA198",
            highlight: "#B58900",
            textColor: "#002B36",
            textColorLight: "#657B83",
            textColorDark: "#FDF6E3",
            textColorM: "#839496",
            textColorMDark: "#93A1A1",
            textColorMLight: "#586E75",
        },
    },
};

const CSS_VAR_MAP = {
    primary: "--primary-color",
    primaryHover: "--primary-color-hover",
    secondary: "--secondary-color",
    tertiary: "--tertiary-color",
    background: "--background-color",
    backgroundHighlightLight: "--background-color-highlight-light",
    backgroundHighlight: "--background-color-highlight",
    accent: "--accent-color",
    highlight: "--highlight-color",
    textColor: "--text-color-white",
    textColorLight: "--text-color-light",
    textColorDark: "--text-color-dark",
    textColorM: "--text-color-medium",
    textColorMLight: "--text-color-medium-light",
    textColorMDark: "--text-color-medium-dark",
};

function getThemeColors(themeName, isDark) {
    const theme = THEMES[themeName] ?? THEMES.default;
    return isDark ? theme.dark : theme.light;
}

function injectColorStyles() {
    const styleId = "accessibility-color-vars";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
        body {
            background-color: var(--background-color, #ffffff) !important;
            color: var(--text-color-dark, #111827) !important;
        }
        a {
            color: var(--accent-color, #2563eb);
        }
        .toggle-slider {
            background-color: var(--accent-color, #2563eb) !important;
        }
        input:checked + .toggle-slider {
            background-color: var(--accent-color, #2563eb) !important;
        }
    `;
    document.head.appendChild(style);
}

function applyColors(colors) {
    Object.entries(colors).forEach(([key, value]) => {
        const cssVar = CSS_VAR_MAP[key];
        if (cssVar) document.documentElement.style.setProperty(cssVar, value);
    });
}

export { THEMES, CSS_VAR_MAP, getThemeColors, injectColorStyles, applyColors };
