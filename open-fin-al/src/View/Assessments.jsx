import React, { useState, Component } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import FinancialKnowledgeSurvey from './FinancialKnowledgeSurvey';
import RiskSurvey from './RiskSurvey';

class Assessments extends Component {
  render() {
    return (
      <main>
        <header className="top-nav">
          <div className="nav-left">
            <h1><span className="material-icons">assignment</span> Assessments</h1>
          </div>
          <div className="nav-right">
            <span className="material-icons large-material-icon" onClick={() => this.handleNavigation('/settings')}>account_circle</span>
          </div>
        </header>
        <section className="knowledge-survey">
          <FinancialKnowledgeSurvey />
        </section>
        <section className="risk-survey">
          <h1>PLEASE BE AWARE: The following survey will be replaced with the survey that Team 3 is currently building.</h1>
          <RiskSurvey /> {/*TODO: Replace with Team 3's risk survey*/}
        </section>
      </main>
    )
  }
}
export { Assessments }