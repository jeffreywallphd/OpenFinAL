    import React, { useState, useEffect } from "react";
    import {PortfolioInteractor} from "../../Interactor/PortfolioInteractor";
    import {UserInteractor} from "../../Interactor/UserInteractor";
    import {JSONRequest} from "../../Gateway/Request/JSONRequest";
    import { useNavigate, useLocation } from 'react-router-dom';

    function PortfolioCreation(props) {   
        const [name, setName] = useState("");
        const [defaultPortfolio, setDefaultPortfolio] = useState(false);
        const [portfolios, setPortfolios] = useState([]);

        const getPortfolios = async () => {
            try {
                // Get user from localStorage (auth system)
                const savedUser = localStorage.getItem('openfinAL_user');
                if (!savedUser) return;
                
                const userData = JSON.parse(savedUser);
                if (!userData.id) return;

                const interactor = new PortfolioInteractor();
                const requestObj = new JSONRequest(JSON.stringify({
                    request: {
                        portfolio: {
                            userId: userData.id
                        }
                    }
                }));

                const response = await interactor.get(requestObj);
                setPortfolios(response?.response?.results || []);
            } catch (error) {
                console.error('Error fetching portfolios:', error);
            }
        };

        const handleSubmit = async (event) => {      
            event.preventDefault(); // prevent page reload

            try {
                // Validate portfolio name
                if (!name || name.trim() === '') {
                    alert('Please enter a portfolio name');
                    return;
                }

                // Get user from localStorage (auth system)
                const savedUser = localStorage.getItem('openfinAL_user');
                if (!savedUser) {
                    alert('User not found. Please log in again.');
                    return;
                }
                
                const userData = JSON.parse(savedUser);
                if (!userData.id) {
                    alert('Invalid user session. Please log in again.');
                    return;
                }

                const interactor = new PortfolioInteractor();
                const requestObj = new JSONRequest(JSON.stringify({
                    request: {
                        portfolio: {
                            name: name,
                            userId: userData.id,
                            isDefault: defaultPortfolio ? 1 : 0
                        }
                    }
                }));

                const response = await interactor.post(requestObj);
                
                console.log('Portfolio creation response:', response);
                
                // Check the nested response object
                if (response.response?.status === 200 && response.response?.ok) {
                    props.state.setState({createPortfolio: false});
                    alert('Portfolio created successfully!');

                    // Force refresh of the route after state change
                    setTimeout(() => {
                        getPortfolios(); // Refresh portfolio list
                        navigate('/refresh', { replace: true }); // dummy path
                        setTimeout(() => {
                            navigate(location.pathname, { replace: true }); // go back
                        }, 10);
                    }, 50); // slight delay to allow config update
                } else {
                    console.error('Portfolio creation failed:', response);
                    const errorMsg = response.response?.data?.error || 'Unknown error';
                    alert('Failed to create portfolio: ' + errorMsg);
                }
            } catch (error) {
                console.error('Portfolio creation error:', error);
                alert('Error creating portfolio: ' + error.message);
            }
        };

        const handleCancel = async (event) => {      
            event.preventDefault(); // prevent page reload
            props.state.setState({createPortfolio: false});
        };

        useEffect(() => {
            getPortfolios();
        }, []);

        const navigate = useNavigate();
        const location = useLocation();

        return (
            <>
                <div className="table-header">
                    <h3>Create a New Portfolio</h3>
                </div>
                <div className="table-row">
                    <div className="table-cell">
                        Portfolio Name: 
                    </div>
                    <div className="table-cell" >
                        <input type="text"value={name} onChange={(e) => setName(e.target.value)}/>
                    </div>
                </div>
                <div className="table-row">
                    <div className="table-cell">
                        Set as Default Portfolio: 
                    </div>
                    <div className="table-cell">
                        <input type="checkbox" checked={defaultPortfolio}
                            onChange={(e) => setDefaultPortfolio(e.target.checked)} />
                    </div>
                </div>
                <button onClick={handleSubmit}>Create Portfolio</button> <button onClick={handleCancel}>Cancel</button>
            </>
        );
    }
    export { PortfolioCreation };
