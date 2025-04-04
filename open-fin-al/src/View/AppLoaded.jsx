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
import Home from "./Home";
import Portfolio from "./Portfolio";
import { Analysis } from "./Analysis";
import BrowseFAQ from "./BrowseFAQ";
import TermDefinitions from "./TermDefinitions";
import BuyReport from "./BuyReport";
import { TimeSeries } from "./TimeSeriesPage";
import { News } from "./NewsPage";
import { Learn } from "./Learn";
import { LearningModuleDetails } from "./LearningModuleDetails";
import { LearningModulePage } from "./LearningModulePage";
import logo from "../Asset/Image/logo.png";
import logoNoText from "../Asset/Image/openfinal_logo_no_text.png";
import navIcon from "../Asset/Image/navIcon.png";
import { Settings } from "./APIConfigSetting";
import Forecast from "./Forecast";
import { ForecastFeature } from "./ForecastFeature";
import ForecastModel from "./ForecastModel";
import { SecReport } from "./SecReport";
import InvestmentPool from "./InvestmentPool";
import StockAnalysis from "./StockAnalysis";

// Scrolls to the top of a page after every route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

class AppLoaded extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuCollapsed: false
    };
    this.toggleMenu = this.toggleMenu.bind(this);
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

    img.src=logoNoText;
    
    
  };
  

  render() {
    const { menuCollapsed } = this.state;
    return (
      <HashRouter>
        <>
          <div className="main">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
            <aside className={`sidebar ${menuCollapsed ? 'collapsed' : ''}`}>
              <div className="logo sidebar-padding">
                <img src={logo} alt="OpenFinAL Logo" class={`logo ${menuCollapsed ? 'hidden' : ''}`} />
                <img src={logoNoText} alt="OpenFinAL Logo" class={`logo ${!menuCollapsed ? 'hidden' : ''}`} />
                
              </div>
              <div>
                <button onClick={this.handleClick} class="HamburgerMenu"><i class="fa fa-bars"></i></button>
              </div>
              <nav className="sidebar-padding">
                <h5>Main</h5>
                <ul>
                  <li><NavLink to="/"><span className="material-icons">dashboard</span> Dashboard</NavLink></li>
                  <li><NavLink to="/portfolio"><span className="material-icons">pie_chart</span> Portfolio</NavLink></li>
                  <li><NavLink to="/price"><span className="material-icons">attach_money</span> Stock & Fund</NavLink></li>
                  <li><NavLink to="/analysis"><span className="material-icons">assessment</span> Risk Analysis</NavLink></li>
                  <li><NavLink to="/browsefaq"><span className="material-icons">help_outline</span> Browse Our FAQs</NavLink></li>
                  <li><NavLink to="/investment-pool"><span className="material-icons">inventory_2</span> Investment Pool</NavLink></li>
                  <li><NavLink to="/StockAnalysis"><span className="material-icons">timeline</span> Stock Analysis</NavLink></li>
                </ul>
              </nav>
              <div className="tools sidebar-padding">
                <h5 className="mt-1">Tools</h5>
                <ul>
                  <li><NavLink to="/forecast"><span className="material-icons">timeline</span> Forecast</NavLink></li>
                  <li><NavLink to="/news"><span className="material-icons">article</span> News</NavLink></li>
                  <li><NavLink to="/learn"><span className="material-icons">school</span> Learn</NavLink></li>
                  <li><NavLink to="/settings"><span className="material-icons">settings</span> Settings</NavLink></li>
                </ul>
              </div>
            </aside>
            <div className="content">
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/buy-report" element={<BuyReport />} />
                <Route path="/browsefaq" element={<BrowseFAQ />}/>
                <Route path="/termdefinitions" element={<TermDefinitions />}/>
                <Route path="/price" element={<TimeSeries />} />
                <Route path="/news" element={<News />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/learningModule" element={<LearningModuleDetails />} />
                <Route path="/learningModulePage" element={<LearningModulePage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/forecast" element={<Forecast />} />
                <Route path="/forecast-features" element={<ForecastFeature />} />
                <Route path="/forecast-models" element={<ForecastModel />} />
                <Route path="/sec-report" element={<SecReport />} />
                <Route path="/investment-pool" element={<InvestmentPool />} /> 
                <Route path="/StockAnalysis" element={<StockAnalysis />} />
              </Routes>
              <footer>
                This software is licensed under the GPL-3.0 license.
              </footer>
            </div>
          </div>
        </>
      </HashRouter>
    );
  }
}

export default AppLoaded;
