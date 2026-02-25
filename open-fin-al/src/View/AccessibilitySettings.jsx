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
        LargeText: false,
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
                setSettings({
                    LargeText: !!(config.AccessibilitySettings?.LargeText),
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
            LargeText: "large-text",
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
