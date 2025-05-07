    import React, { useState, useEffect } from "react";
    import {PortfolioInteractor} from "../../Interactor/PortfolioInteractor";
    import {UserInteractor} from "../../Interactor/UserInteractor";
    import {JSONRequest} from "../../Gateway/Request/JSONRequest";
    import { useNavigate, useLocation } from 'react-router-dom';

    function PortfolioCreation(props) {   
        const [name, setName] = useState("");
        const [description, setDescription] = useState("");
        const [defaultPortfolio, setDefaultPortfolio] = useState(false);
        const [portfolios, setPortfolios] = useState([]);

        const getPortfolios = async () => {
            const userInteractor = new UserInteractor();
            const userRequestObj = new JSONRequest(JSON.stringify({
                request: {
                    user:{
                        username: await window.config.getUsername()
                    }
                }
            }));
            const user = await userInteractor.get(userRequestObj);

            const interactor = new PortfolioInteractor();
            const requestObj = new JSONRequest(JSON.stringify({
                request: {
                    portfolio: {
                        userId: user.response?.results[0]?.id
                    }
                }
            }));

            const response = await interactor.get(requestObj);
            setPortfolios(response?.response?.results || []);
        };

        const handleSubmit = async (event) => {      
            event.preventDefault(); // prevent page reload

            const userInteractor = new UserInteractor();
            const userRequestObj = new JSONRequest(JSON.stringify({
                request: {
                    user:{
                        username: await window.config.getUsername()
                    }
                }
            }));
            const user = await userInteractor.get(userRequestObj);
            
            const interactor = new PortfolioInteractor();
            const requestObj = new JSONRequest(JSON.stringify({
                request: {
                    portfolio: {
                        name: name,
                        description: description,
                        userId: user.response?.results[0]?.id,
                        isDefault: defaultPortfolio ? 1 : 0
                    }
                }
            }));

            const response = await interactor.post(requestObj);
            props.state.setState({createPortfolio: false});

            // Force refresh of the route after state change
            setTimeout(() => {
                navigate('/refresh', { replace: true }); // dummy path
                setTimeout(() => {
                    navigate(location.pathname, { replace: true }); // go back
                }, 10);
            }, 50); // slight delay to allow config update
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
                        Portfolio Description: 
                    </div>
                    <div className="table-cell">
                        <textarea value={description} 
                            onChange={(e) => setDescription(e.target.value)} >    
                        </textarea>
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
