// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React from "react";
import { NavLink } from "react-router-dom";
import { FaLightbulb } from "react-icons/fa";

export function RecommendedModuleCard({ module, reason, progress = 0 }) {
    if (!module) return null;

    return (
        <div className="recommended-module-card">
            <div className="recommended-badge">Recommended</div>
            
            <div className="recommended-content">
                <div className="recommended-main">
                    <h2 className="recommended-title">
                        Personalized Pick: {module.title}
                    </h2>
                    <p className="recommended-description">{module.description}</p>
                    
                    {reason && (
                        <div className="recommended-reason">
                            <span className="reason-label">Reason:</span> {reason}
                        </div>
                    )}
                    
                    <div className="recommended-time">
                        <span className="time-icon">⏱</span>
                        <span>Estimated time: {module.timeEstimate} min</span>
                    </div>
                </div>
                
                <div className="recommended-icon-container">
                    <div className="icon-rays">
                        <span className="ray ray-1"></span>
                        <span className="ray ray-2"></span>
                        <span className="ray ray-3"></span>
                        <span className="ray ray-4"></span>
                        <span className="ray ray-5"></span>
                        <span className="ray ray-6"></span>
                        <span className="ray ray-7"></span>
                        <span className="ray ray-8"></span>
                    </div>
                    <div className="recommended-icon">
                        <FaLightbulb />
                    </div>
                </div>
            </div>
            
            <div className="recommended-progress-section">
                <div className="progress-header">
                    <span className="progress-label">Progress</span>
                    <span className="progress-percentage">{progress}% complete</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
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
                className="recommended-link"
            >
                <span className="sr-only">View {module.title}</span>
            </NavLink>
        </div>
    );
}
