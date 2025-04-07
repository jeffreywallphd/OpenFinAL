import React, { useState, useEffect } from 'react';
import RiskSurvey from './RiskSurvey';

const InvestmentPool = () => {
  const [showSurvey, setShowSurvey] = useState(false);
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const [pools, setPools] = useState([]);
  const [newPool, setNewPool] = useState({
    name: '',
    riskLevel: 'Low',
    amountMin: '',
    isPrivate: false,
  });
  const [editIndex, setEditIndex] = useState(null);
  const [filter, setFilter] = useState('All');

  const investments = [
    { id: 1, name: 'Tech Growth Fund', type: 'Mutual Fund', risk: 'Moderate', returns: '12.5%', allocation: '25%' },
    { id: 2, name: 'Blue Chip Portfolio', type: 'Stocks', risk: 'Low', returns: '8.2%', allocation: '30%' },
    { id: 3, name: 'Emerging Markets', type: 'ETF', risk: 'High', returns: '15.8%', allocation: '15%' },
    { id: 4, name: 'Bond Portfolio', type: 'Bonds', risk: 'Low', returns: '5.5%', allocation: '30%' },
  ];

  useEffect(() => {
    const savedPools = JSON.parse(localStorage.getItem('pools'));
    if (savedPools) setPools(savedPools);
  }, []);

  useEffect(() => {
    localStorage.setItem('pools', JSON.stringify(pools));
  }, [pools]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPool((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPool.name || !newPool.amountMin || isNaN(newPool.amountMin)) {
      alert('Please fill out all fields correctly. "Min Amount" should be a number.');
      return;
    }

    if (editIndex !== null) {
      const updatedPools = pools.map((pool, index) =>
        index === editIndex ? newPool : pool
      );
      setPools(updatedPools);
      setEditIndex(null);
    } else {
      setPools((prev) => [...prev, newPool]);
    }

    setNewPool({
      name: '',
      riskLevel: 'Low',
      amountMin: '',
      isPrivate: false,
    });
    setShowCreatePoolModal(false);
  };

  const handleEditPool = (index) => {
    setNewPool(pools[index]);
    setEditIndex(index);
    setShowCreatePoolModal(true);
  };

  const handleDeletePool = (index) => {
    const updatedPools = pools.filter((_, i) => i !== index);
    setPools(updatedPools);
  };

  const filteredPools = pools.filter((pool) => {
    if (filter === 'All') return true;
    return filter === 'Public' ? !pool.isPrivate : pool.isPrivate;
  });

  return (
    <div className="investment-pool-container">
      <div className="header-container">
        <h2><span className="material-icons">inventory_2</span> Investment Pools</h2>
        <button
          className="survey-button"
          onClick={() => setShowSurvey(true)}
        >
          Take Risk Survey
        </button>
        <button
          className="create-pool-button"
          onClick={() => {
            setNewPool({
              name: '',
              riskLevel: 'Low',
              amountMin: '',
              isPrivate: false,
            });
            setShowCreatePoolModal(true);
          }}
        >
          Create New Pool
        </button>
      </div>

      <div className="content-grid">
        {/* Left Side */}
        <div className="metrics-and-investments">
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Assets</h3>
              <p className="metric-value">$2.45M</p>
            </div>
            <div className="metric-card">
              <h3>Total Return</h3>
              <p className="metric-value green">+10.5%</p>
            </div>
            <div className="metric-card">
              <h3>Risk Score</h3>
              <p className="metric-value">6.8/10</p>
            </div>
            <div className="metric-card">
              <h3>Active Investments</h3>
              <p className="metric-value">12</p>
            </div>
          </div>

          <div className="table-container">
            <h2>Investment Allocation</h2>
            <table className="investment-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Risk Level</th>
                  <th>Returns</th>
                  <th>Allocation</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((investment) => (
                  <tr key={investment.id}>
                    <td>{investment.name}</td>
                    <td>{investment.type}</td>
                    <td>{investment.risk}</td>
                    <td>{investment.returns}</td>
                    <td>{investment.allocation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side */}
        <div className="investment-pools">
          <h2>Your Investment Pools</h2>
          <label>Filter Pools:</label>
          <select onChange={(e) => setFilter(e.target.value)} value={filter}>
            <option value="All">All</option>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
          <br />
          <table className="investment-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Risk Level</th>
                <th>Min Amount</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPools.map((pool, index) => (
                <tr key={index}>
                  <td>{pool.name}</td>
                  <td>{pool.riskLevel}</td>
                  <td>${pool.amountMin}</td>
                  <td>{pool.isPrivate ? 'Private' : 'Public'}</td>
                  <td>
                    <button className='btn-success-sm' onClick={() => handleEditPool(index)}>Edit</button>
                    <button className='btn-danger-sm' onClick={() => handleDeletePool(index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>

      {/* Survey Modal */}
      {showSurvey && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-button"
              onClick={() => setShowSurvey(false)}
            >
              ×
            </button>
            <RiskSurvey onClose={() => setShowSurvey(false)} />
          </div>
        </div>
      )}

      {/* Create Pool Modal */}
      {showCreatePoolModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-button"
              onClick={() => setShowCreatePoolModal(false)}
            >
              ×
            </button>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={newPool.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Risk Level</label>
                <select
                  name="riskLevel"
                  value={newPool.riskLevel}
                  onChange={handleInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Minimum Amount</label>
                <input
                  type="number"
                  name="amountMin"
                  value={newPool.amountMin}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Privacy</label>
                <select
                  name="isPrivate"
                  value={newPool.isPrivate ? "Private" : "Public"}
                  onChange={(e) =>
                    setNewPool((prev) => ({
                      ...prev,
                      isPrivate: e.target.value === "Private",
                    }))
                  }
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>

              <button type="submit" className="submit-button">
                {editIndex !== null ? 'Save Changes' : 'Create Pool'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentPool;
