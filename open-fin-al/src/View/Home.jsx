// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { Component } from 'react';
import profileIcon from "../Asset/Image/profile.jpg";
import { NewsInteractor } from "../Interactor/NewsInteractor";
import { JSONRequest } from "../Gateway/Request/JSONRequest";
import { NewsBrowser } from "./News/Browser";
import { useNavigate, Link  } from 'react-router-dom';

const withNavigation = (Component) => {
  return function WrappedComponent(props) {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
};

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
        newsData: null,
        currentNewsIndex: 0
    };

    //Bind methods for element events
    this.getEconomicNews = this.getEconomicNews.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleNavigation = this.handleNavigation.bind(this);
  }

  async componentDidMount() {
    this.getEconomicNews();
  }

  handleNavigation(location) {
    this.props.navigate(location);
  }

  async getEconomicNews() {
      const interactor = new NewsInteractor();
      const requestObj = new JSONRequest(JSON.stringify({
          request: {
              news: {
                  topic: "economy_macro",
                  limit: 20
              }              
          }
      }));

      const response = await interactor.get(requestObj);

      if(response.response.ok) {
          this.setState({
            newsData: response.response.results[0]["data"],
            currentListing: response.response.results[0]["data"][0]
          });
          return true;
      } else {
          return false;
      }    
  }

  handleNext() {
    if(this.state.newsData) {
      const length = this.state.newsData.length;
      if(this.state.currentNewsIndex < length - 1) {
        this.setState({currentNewsIndex: this.state.currentNewsIndex + 1});
        this.setState({currentListing: this.state.newsData[this.state.currentNewsIndex + 1]});
      }
    }
  }

  handlePrevious() {
    if(this.state.newsData) {
      const length = this.state.newsData.length;
      if(this.state.currentNewsIndex > 0) {
        this.setState({currentNewsIndex: this.state.currentNewsIndex - 1});
        this.setState({currentListing: this.state.newsData[this.state.currentNewsIndex - 1]});
      }
    }
  }

  render() {
    return (
      <main>
        <header className="top-nav">
          <div className="nav-left">
            <h1><span className="material-icons">dashboard</span> Dashboard</h1>
          </div>
          <div className="nav-center">
            <span className="material-icons search-icon">search</span>
            <input type="search" placeholder="Search OpenFinAL" />
          </div>
          <div className="nav-right">
            <img src={profileIcon} alt="profile pic" className='profile-picture' />
          </div>
        </header>
        <section className="content-grid">
          <div className="stats">
            <div className="current-month">
              <h6>Current Month</h6>
              <h3>$682.5</h3>
              <hr />
              <p><span className="material-icons">check_circle</span>Trades</p>
            </div>
            <div className="your-trades">
              <h3>Recent Trades</h3>
              <div className="trade">
                <p>Netflix</p>
                <span className="trade-amount positive">+ $50</span>
                <span className="trade-time">Today, 16:36</span>
              </div>
              <div className="trade">
              <Link to="/portfolio" className="all-trades-link">
                All Trades &rarr;
              </Link>
                <button className="trade-button" onClick={() => this.handleNavigation('/price')}>Trade Now</button>
              </div>
            </div>
            <div className="earnings">
              <h3><span className="material-icons">trending_up</span> Total Value</h3>
              <p>$350.40</p>
            </div>
            <div className="invested">
              <h3><span className="material-icons">account_balance_wallet</span> Total Invested</h3>
              <p>$300.10</p>
            </div>
            <div className="promo">
              <div className="promo-text">
                <h2>Try OpenFinAL Now!</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
            </div>
          </div>
          <div className="news-updates">
            {this.state.newsData ?
                <NewsBrowser handlePrevious={this.handlePrevious} handleNext={this.handleNext} listingData={this.state.currentListing}/>
                 :
                null
            }
          </div>
        </section>
      </main>
    );
  }
}

export default withNavigation(Home);