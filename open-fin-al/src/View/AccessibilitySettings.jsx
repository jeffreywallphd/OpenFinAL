import React, { useEffect, useState } from "react";
import { useHeader } from "./App/LoadedLayout";

function ToggleRow({ id, label, description, checked, onChange }) {
    return (
        <div className="toggle-row">
            <div className="toggle-info">
                <h4>{label}</h4>
                <p>{description}</p>
            </div>
            <label className="toggle-switch" htmlFor={id}>
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={onChange}
                />
                <span className="toggle-slider"></span>
            </label>
        </div>
    );
}

function AccessibilitySettings() {
    const { setHeader } = useHeader();

    const [settings, setSettings] = useState({
        LargeText: 100,
        HighContrast: false,
        ReduceMotion: false,
        EnhancedFocus: false,
        DarkMode: false,
    });
    const [statusMsg, setStatusMsg] = useState("");

    useEffect(() => {
        setHeader({ title: "Accessibility", icon: "accessibility" });
    }, [setHeader]);

    useEffect(() => {
        const loadSettings = async () => {
            const config = await window.config.load();
            if (config) {
                const largeTextVal = config.AccessibilitySettings?.LargeText;
                setSettings({
                    LargeText: typeof largeTextVal === "number" ? largeTextVal : (largeTextVal ? 120 : 100),
                    HighContrast: !!(config.AccessibilitySettings?.HighContrast),
                    ReduceMotion: !!(config.AccessibilitySettings?.ReduceMotion),
                    EnhancedFocus: !!(config.AccessibilitySettings?.EnhancedFocus),
                    DarkMode: !!config.DarkMode,
                });
            }
        };
        loadSettings();
    }, []);

    const handleToggle = async (key) => {
        const newValue = !settings[key];
        const newSettings = { ...settings, [key]: newValue };
        setSettings(newSettings);

        // Apply body class immediately
        const classMap = {
            HighContrast: "high-contrast",
            ReduceMotion: "reduce-motion",
            EnhancedFocus: "enhanced-focus",
            DarkMode: "dark-mode",
        };
        document.body.classList.toggle(classMap[key], newValue);

        // Save to config
        const config = await window.config.load();
        if (config) {
            if (key === "DarkMode") {
                config.DarkMode = newValue;
            } else {
                if (!config.AccessibilitySettings) {
                    config.AccessibilitySettings = {};
                }
                config.AccessibilitySettings[key] = newValue;
            }
            await window.config.save(config);
            setStatusMsg(`${key.replace(/([A-Z])/g, ' $1').trim()} ${newValue ? "enabled" : "disabled"}.`);
            setTimeout(() => setStatusMsg(""), 3000);
        }
    };

    const handleTextSize = async (value) => {
        const size = Number(value);
        setSettings((prev) => ({ ...prev, LargeText: size }));

        // Apply immediately
        document.body.classList.toggle("large-text", size > 100);
        document.documentElement.style.setProperty("--text-scale", size / 100);

        // Save to config
        const config = await window.config.load();
        if (config) {
            if (!config.AccessibilitySettings) {
                config.AccessibilitySettings = {};
            }
            config.AccessibilitySettings.LargeText = size;
            await window.config.save(config);
            setStatusMsg(`Text size set to ${size}%.`);
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
                    <div className="toggle-row">
                        <div className="toggle-info">
                            <h4>Text Size</h4>
                            <p>Adjust the base font size ({settings.LargeText}%).</p>
                        </div>
                        <div className="text-size-slider">
                            <input
                                type="range"
                                id="slider-text-size"
                                min="80"
                                max="150"
                                step="5"
                                value={settings.LargeText}
                                onChange={(e) => handleTextSize(e.target.value)}
                                aria-label={`Text size: ${settings.LargeText}%`}
                            />
                        </div>
                    </div>
                    <ToggleRow
                        id="toggle-dark-mode"
                        label="Dark Mode"
                        description="Switches the app to a dark color scheme. Also available in Settings."
                        checked={settings.DarkMode}
                        onChange={() => handleToggle("DarkMode")}
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
