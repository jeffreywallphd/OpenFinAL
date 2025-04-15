// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { Component } from 'react';
import profileIcon from "../Asset/Image/profile.jpg";
import newsImage from "../Asset/Image/news.jpg";

class Home extends Component {
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
                <p>Apple Inc</p>
                <span className="trade-amount negative">- $27</span>
                <span className="trade-time">Today, 08:49</span>
              </div>
              <a href="#" className="all-trades-link">All Trades &rarr;</a>
            </div>
            <div className="earnings">
              <h3><span className="material-icons">trending_up</span> Total Earnings</h3>
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
                <button className="trade-button">Trade Now</button>
              </div>
            </div>
          </div>

          <div className="news-updates">
            <div className="news-item">
              <h4><span className="material-icons">event</span> Why do we mark International Days?</h4>
              <div className="news-image">
                <img src={newsImage} alt="News Image" className='news-img' />
              </div>
              <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
              <p><span className="material-icons">date_range</span> Date: 02 Oct, 2024</p>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default Home;
