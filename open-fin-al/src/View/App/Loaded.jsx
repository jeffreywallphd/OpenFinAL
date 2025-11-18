// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { Component, useEffect, useContext } from "react";
import {
  Routes,
  Route,
  NavLink,
  HashRouter,
  useLocation
} from "react-router-dom";
import { DataContext } from "../App";

// Imports for react pages and assets
import Home from "../Home";
import Portfolio from "../Portfolio";
import { Analysis } from "../Analysis";
import BuyReport from "../BuyReport";
import { TimeSeries } from "../Stock";
import { News } from "../News";
import { Assessments } from "../Assessment/Assessments";
import { Learn } from "../Learn";
import { LearningModuleDetails } from "../LearningModule/LearningModuleDetails";
import { LearningModulePage } from "../LearningModule/LearningModulePage";
import logo from "../../Asset/Image/logo.png";
import logoNoText from "../../Asset/Image/openfinal_logo_no_text.png";
import logoNoTextDark from "../../Asset/Image/openfinal_logo_dark_no_text.png";
import logoDark from "../../Asset/Image/logo-dark.png";
import navIcon from "../../Asset/Image/navIcon.png";
import { Settings } from "../Settings";
import Forecast from "../Forecast";
import { ForecastFeature } from "../ForecastFeature";
import ForecastModel from "../ForecastModel";
import StockAnalysis from "../StockAnalysis";
import ChatbotToggle from "../Chatbot/ChatbotToggle";
import RiskAnalysis from "../RiskAnalysis/RiskAnalysis";
import SurveyDemo from "../SurveyTemplate/SurveyDemo";
import { UserInfo } from "./UserInfo";

// Scrolls to the top of a page after every route change
function ScrollToTop({ onRouteChange }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (onRouteChange) onRouteChange();
  }, [pathname]);

  return null;
}

class AppLoaded extends Component {
  constructor(props) {
    super(props);

    this.props = props;

    this.state = {
      menuCollapsed: false,
    };

    this.toggleMenu = this.toggleMenu.bind(this);
    this.checkDarkMode = this.checkDarkMode.bind(this);
  }

  componentDidMount() {
    this.checkDarkMode();
  }

  toggleMenu() {
    this.setState(prevState => ({
      menuCollapsed: !prevState.menuCollapsed
    }));
  }

  handleClick = () => {
    this.setState(prevState => ({
      menuCollapsed: !prevState.menuCollapsed
    }));
    var img = document.getElementById("logo");
  };

  async checkDarkMode() {
    const config = await window.config.load();
    const darkMode = config.DarkMode;

    if (darkMode !== this.state.darkMode) {
      this.setState({
        darkMode,
        logo: darkMode ? logoDark : logo,
        logoNoText: darkMode ? logoNoTextDark : logoNoText
      });
    }
  }

  render() {
    const { menuCollapsed } = this.state;
    return (
      <HashRouter>
        <>
          <div className="main">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
            {/* Top Header Bar */}
            <header className="top-header">
              <div className="header-left">
                <button onClick={this.handleClick} className="HamburgerMenu"><i className="fa fa-bars"></i></button>
                <div className="header-logo">
                  <img src={this.state.logo} alt="OpenFinAL Logo" className="header-logo-img" />
                </div>
              </div>
              <div className="header-right">
                <UserInfo onLogout={this.props.onLogout} />
              </div>
            </header>

            <aside className={`sidebar ${menuCollapsed ? 'collapsed' : ''}`}>
              <nav className="sidebar-padding">
                <ul>
                  <li><NavLink to="/"><span className="material-icons">dashboard</span> Dashboard</NavLink></li>
                  <li><NavLink to="/portfolio"><span className="material-icons">pie_chart</span> Portfolio</NavLink></li>
                  <li><NavLink to="/price"><span className="material-icons">attach_money</span> Stock Trends</NavLink></li>
                  <li><NavLink to="/analysis"><span className="material-icons">assessment</span> Risk Analysis</NavLink></li>
                  <li><NavLink to="/StockAnalysis"><span className="material-icons">compare</span> Stock Comparison</NavLink></li>
                  <li><NavLink to="/forecast"><span className="material-icons">timeline</span> Forecast</NavLink></li>
                  <li><NavLink to="/news"><span className="material-icons">article</span> News</NavLink></li>
                  <li><NavLink to="/assessments"><span className="material-icons">assignment</span> Assessments</NavLink></li>
                  <li><NavLink to="/learn"><span className="material-icons">school</span> Learn</NavLink></li>
                  <li><NavLink to="/settings"><span className="material-icons">settings</span> Settings</NavLink></li>
                  {/* <li><NavLink to="/survey-demo"><span className="material-icons">assessment</span> Survey Demo</NavLink></li> */}
                </ul>
              </nav>
            </aside>
            <div className={`content ${menuCollapsed ? 'closed' : ''} with-header`}>
              <ScrollToTop  onRouteChange={this.checkDarkMode}/>

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/analysis" element={<RiskAnalysis />} />
                <Route path="/analysis-bad" element={<Analysis />} />
                <Route path="/buy-report" element={<BuyReport />} />
                <Route path="/price" element={<TimeSeries />} />
                <Route path="/news" element={<News />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/learningModule" element={<LearningModuleDetails />} />
                <Route path="/learningModulePage" element={<LearningModulePage />} />
                <Route path="/settings" element={<Settings initialConfiguration={false} checkIfConfigured={this.props.checkIfConfigured} handleConfigured={this.props.handleConfigured} />} />
                <Route path="/assessments" element={<Assessments />}></Route>
                <Route path="/forecast" element={<Forecast />} />
                <Route path="/forecast-features" element={<ForecastFeature />} />
                <Route path="/forecast-models" element={<ForecastModel />} />
                <Route path="/StockAnalysis" element={<StockAnalysis />} />
                <Route path="/survey-demo" element={<SurveyDemo />} />
              </Routes>
            </div>
            <footer className={`footer ${menuCollapsed ? 'collapsed' : ''}`}>
              Licensed under GPL-3.0<br />&copy;2023 All rights reserved
            </footer>
          </div>
        </>
        <ChatbotToggle />

      </HashRouter>

    );
  }
}

export default AppLoaded;
