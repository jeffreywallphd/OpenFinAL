import React, { useEffect, useState } from "react";
import { useHeader } from "./App/LoadedLayout";
import { THEMES, getThemeColors, injectColorStyles, applyColors } from "./themes";

function ToggleRow({ id, label, description, checked, onChange }) {
    return (
        <div className="toggle-row">
            <div className="toggle-info">
                <h4>{label}</h4>
                <p>{description}</p>
            </div>
            <label className="toggle-switch" htmlFor={id}>
                <input type="checkbox" id={id} checked={checked} onChange={onChange} />
                <span className="toggle-slider"></span>
            </label>
        </div>
    );
}

function AccessibilitySettings() {
    const { setHeader } = useHeader();

    const [settings, setSettings] = useState({
        LargeText: false,
        HighContrast: false,
        ReduceMotion: false,
        EnhancedFocus: false,
    });

    const [colorTheme, setColorTheme] = useState("default");
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");

    useEffect(() => {
        setHeader({ title: "Accessibility", icon: "accessibility" });
        injectColorStyles();
    }, [setHeader]);

    useEffect(() => {
        const loadSettings = async () => {
            const config = await window.config.load();
            if (config) {
                setSettings({
                    LargeText: !!config.AccessibilitySettings?.LargeText,
                    HighContrast: !!config.AccessibilitySettings?.HighContrast,
                    ReduceMotion: !!config.AccessibilitySettings?.ReduceMotion,
                    EnhancedFocus: !!config.AccessibilitySettings?.EnhancedFocus,
                });

                const savedTheme = config.AccessibilitySettings?.ColorTheme ?? "default";
                const savedIsDark = !!(config.AccessibilitySettings?.IsDarkTheme ?? config.DarkMode);

                setColorTheme(savedTheme);
                setIsDarkTheme(savedIsDark);

                const colorsToApply = getThemeColors(savedTheme, savedIsDark);
                applyColors(colorsToApply);
            }
        };
        loadSettings();
    }, []);

    const handleThemeChange = async (e) => {
        const theme = e.target.value;
        setColorTheme(theme);

        const colorsToApply = getThemeColors(theme, isDarkTheme);
        applyColors(colorsToApply);

        const config = await window.config.load();
        if (config) {
            if (!config.AccessibilitySettings) config.AccessibilitySettings = {};
            config.AccessibilitySettings.ColorTheme = theme;
            await window.config.save(config);
            const label = THEMES[theme]?.label ?? theme;
            setStatusMsg(`Color theme set to ${label}.`);
            setTimeout(() => setStatusMsg(""), 3000);
        }
    };

    const handleDarkThemeToggle = async () => {
        const newIsDark = !isDarkTheme;
        setIsDarkTheme(newIsDark);

        document.body.classList.toggle("dark-mode", newIsDark);
        applyColors(getThemeColors(colorTheme, newIsDark));

        const config = await window.config.load();
        if (config) {
            if (!config.AccessibilitySettings) config.AccessibilitySettings = {};
            config.AccessibilitySettings.IsDarkTheme = newIsDark;
            config.DarkMode = newIsDark;
            await window.config.save(config);
            setStatusMsg(`Dark variant ${newIsDark ? "enabled" : "disabled"}.`);
            setTimeout(() => setStatusMsg(""), 3000);
        }
    };

    const handleToggle = async (key) => {
        const newValue = !settings[key];
        setSettings({ ...settings, [key]: newValue });

        const classMap = {
            LargeText: "large-text",
            HighContrast: "high-contrast",
            ReduceMotion: "reduce-motion",
            EnhancedFocus: "enhanced-focus",
        };
        document.body.classList.toggle(classMap[key], newValue);

        const config = await window.config.load();
        if (config) {
            if (!config.AccessibilitySettings) config.AccessibilitySettings = {};
            config.AccessibilitySettings[key] = newValue;
            await window.config.save(config);
            setStatusMsg(`${key.replace(/([A-Z])/g, " $1").trim()} ${newValue ? "enabled" : "disabled"}.`);
            setTimeout(() => setStatusMsg(""), 3000);
        }
    };

    return (
        <div className="accessibility-settings">
            <div aria-live="polite" aria-atomic="true" className="sr-only">
                {statusMsg}
            </div>

            <section>
                <div className="settings-card">
                    <h3>Display</h3>
                    <ToggleRow
                        id="toggle-large-text"
                        label="Larger Text"
                        description="Increases the base font size to 120% for improved readability."
                        checked={settings.LargeText}
                        onChange={() => handleToggle("LargeText")}
                    />
                </div>
            </section>

            <section>
                <div className="settings-card">
                    <h3>Colors &amp; Contrast</h3>
                    <ToggleRow
                        id="toggle-high-contrast"
                        label="High Contrast"
                        description="Applies a high-contrast color palette for users with low vision or color sensitivity."
                        checked={settings.HighContrast}
                        onChange={() => handleToggle("HighContrast")}
                    />

                    <div className="toggle-row">
                        <div className="toggle-info">
                            <h4>Color Theme</h4>
                            <p>Choose a preset color scheme.</p>
                        </div>
                        <select
                            value={colorTheme}
                            onChange={handleThemeChange}
                            className="color-preset-select"
                            aria-label="Color theme"
                        >
                            {Object.entries(THEMES).map(([key, theme]) => (
                                <option key={key} value={key}>{theme.label}</option>
                            ))}
                        </select>
                    </div>

                    <ToggleRow
                        id="toggle-dark-theme"
                        label="Dark Variant"
                        description="Use the dark version of the selected color theme."
                        checked={isDarkTheme}
                        onChange={handleDarkThemeToggle}
                    />
                </div>
            </section>

            <section>
                <div className="settings-card">
                    <h3>Motion</h3>
                    <ToggleRow
                        id="toggle-reduce-motion"
                        label="Reduce Motion"
                        description="Disables animations and transitions for users sensitive to motion."
                        checked={settings.ReduceMotion}
                        onChange={() => handleToggle("ReduceMotion")}
                    />
                </div>
            </section>

            <section>
                <div className="settings-card">
                    <h3>Focus &amp; Navigation</h3>
                    <ToggleRow
                        id="toggle-enhanced-focus"
                        label="Enhanced Focus Indicators"
                        description="Shows a larger, more visible focus ring around keyboard-focused elements."
                        checked={settings.EnhancedFocus}
                        onChange={() => handleToggle("EnhancedFocus")}
                    />
                </div>
            </section>
        </div>
    );
}

export default AccessibilitySettings;
