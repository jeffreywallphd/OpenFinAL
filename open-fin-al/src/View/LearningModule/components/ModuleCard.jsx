// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React from "react";
import { NavLink } from "react-router-dom";
import { FaChartBar, FaCoins, FaShieldAlt, FaChartLine, FaUniversity, FaHandHoldingUsd } from "react-icons/fa";

// Icon mapping based on module category or keywords
const getModuleIcon = (module) => {
    const category = module.category?.toLowerCase() || "";
    const keywords = module.keywords?.toLowerCase() || "";
    const title = module.title?.toLowerCase() || "";
    
    if (category.includes("blockchain") || keywords.includes("blockchain") || title.includes("blockchain")) {
        return <FaCoins />;
    } else if (category.includes("bond") || keywords.includes("bond") || title.includes("bond")) {
        return <FaUniversity />;
    } else if (category.includes("stock") || keywords.includes("stock") || title.includes("stock")) {
        return <FaChartBar />;
    } else if (title.includes("risk-free") || title.includes("treasury")) {
        return <FaShieldAlt />;
    } else if (title.includes("etf") || keywords.includes("etf")) {
        return <FaChartLine />;
    } else if (title.includes("option") || keywords.includes("option")) {
        return <FaHandHoldingUsd />;
    } else {
        return <FaChartBar />;
    }
};

export function ModuleCard({ module, progress = 0 }) {
    const icon = getModuleIcon(module);
    
    return (
        <div className="module-card">
            <div className="module-icon">{icon}</div>
            
            <div className="module-content">
                <h3 className="module-title">{module.title}</h3>
                <p className="module-description">{module.description}</p>
            </div>
            
            <div className="module-footer">
                <div className="module-meta">
                    <span className="module-time">⏱ {module.timeEstimate} min</span>
                    <span className="module-progress-percent">{progress}%</span>
                </div>
                <div className="module-progress-bar">
                    <div className="module-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            
            <NavLink 
                to="/learningModule" 
                state={{
                    moduleId: module.id,
                    title: module.title,
                    description: module.description,
                    timeEstimate: module.timeEstimate,
                    dateCreated: module.dateCreated,
                    pages: null
                }}
                className="module-link"
            >
                <span className="sr-only">View {module.title}</span>
            </NavLink>
        </div>
    );
}
