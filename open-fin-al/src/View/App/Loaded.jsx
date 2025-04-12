// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { Component, useEffect } from "react";
import {
  Routes,
  Route,
  NavLink,
  HashRouter,
  useLocation
} from "react-router-dom";

// Imports for react pages and assets
import Home from "../Home";
import Portfolio from "../Portfolio";
import { Analysis } from "../Analysis";
import BuyReport from "../BuyReport";
import { TimeSeries } from "../Stock";
import { News } from "../News";
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

// Scrolls to the top of a page after every route change
function ScrollToTop({ onRouteChange }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (onRouteChange) onRouteChange();
  }, [pathname]);

  useEffect(() => {
          const clearDarkMode = () => {
              //localStorage.removeItem("darkMode");
              localStorage.setItem("darkMode", "false");
          };
  
          window.addEventListener("beforeunload", clearDarkMode);
          return () => {
              window.removeEventListener("beforeunload", clearDarkMode);
          };
      }, []); 

  return null;
}

class AppLoaded extends Component {
  constructor(props) {
    super(props);

    const darkMode = localStorage.getItem("darkMode") === "true";

    this.state = {
      menuCollapsed: false,
      darkMode,
      logo: darkMode ? logoDark : logo,
      logoNoText: darkMode ? logoNoTextDark : logoNoText
    };

    this.toggleMenu = this.toggleMenu.bind(this);
    this.checkDarkMode = this.checkDarkMode.bind(this);
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

  checkDarkMode() {
    const darkMode = localStorage.getItem("darkMode") === "true";

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
            <aside className={`sidebar ${menuCollapsed ? 'collapsed' : ''}`}>
              <div className="logo sidebar-padding">
                <img src={this.state.logo} alt="OpenFinAL Logo" className={`logo ${menuCollapsed ? 'hidden' : ''}`} />
                <img src={this.state.logoNoText} alt="OpenFinAL Logo" className={`logoNoText ${!menuCollapsed ? 'hidden' : ''}`} />
              </div>
              <div className="sidebar-padding">
                <button onClick={this.handleClick} className="HamburgerMenu"><i className="fa fa-bars"></i></button>
              </div>
              <nav className="sidebar-padding">
                <ul>
                  <li><NavLink to="/"><span className="material-icons">dashboard</span> Dashboard</NavLink></li>
                  <li><NavLink to="/portfolio"><span className="material-icons">pie_chart</span> Portfolio</NavLink></li>
                  <li><NavLink to="/price"><span className="material-icons">attach_money</span> Stock Trends</NavLink></li>
                  <li><NavLink to="/analysis"><span className="material-icons">assessment</span> Risk Analysis</NavLink></li>
                  <li><NavLink to="/StockAnalysis"><span className="material-icons">compare</span> Stock Comparison</NavLink></li>
                  <li><NavLink to="/forecast"><span className="material-icons">timeline</span> Forecast</NavLink></li>
                  <li><NavLink to="/news"><span className="material-icons">article</span> News</NavLink></li>
                  <li><NavLink to="/learn"><span className="material-icons">school</span> Learn</NavLink></li>
                  <li><NavLink to="/settings"><span className="material-icons">settings</span> Settings</NavLink></li>
                </ul>
              </nav>
            </aside>
            <div className={`content ${menuCollapsed ? 'closed' : ''}`}>
              <ScrollToTop  onRouteChange={this.checkDarkMode}/>

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/buy-report" element={<BuyReport />} />
                <Route path="/price" element={<TimeSeries />} />
                <Route path="/news" element={<News />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/learningModule" element={<LearningModuleDetails />} />
                <Route path="/learningModulePage" element={<LearningModulePage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/forecast" element={<Forecast />} />
                <Route path="/forecast-features" element={<ForecastFeature />} />
                <Route path="/forecast-models" element={<ForecastModel />} />
                <Route path="/StockAnalysis" element={<StockAnalysis />} />
              </Routes>
            </div>
            <footer className={`footer ${menuCollapsed ? 'collapsed' : ''}`}>
              Licensed under GPL-3.0<br/>&copy;2023 All rights reserved
            </footer>
          </div>
        </>
        <ChatbotToggle/>

      </HashRouter>

    );
  }
}

export default AppLoaded;
