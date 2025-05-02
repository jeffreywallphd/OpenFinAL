    import React, { useState } from "react";
    import {PortfolioInteractor} from "../../Interactor/PortfolioInteractor";
    import {UserInteractor} from "../../Interactor/UserInteractor";
    import {JSONRequest} from "../../Gateway/Request/JSONRequest";

    function PortfolioCreation(props) {   
        const [name, setName] = useState("");
        const [description, setDescription] = useState("");
        const [defaultPortfolio, setDefaultPortfolio] = useState(false);

        const handleSubmit = async (event) => {      
            event.preventDefault(); // prevent page reload

            const userInteractor = new UserInteractor();
            const userResponseObj = new JSONRequest(JSON.stringify({
                request: {
                    user:{
                        username: await window.config.getUsername()
                    }
                }
            }));
            const user = await userInteractor.get(userResponseObj);
            window.console.log(user);
            
            const interactor = new PortfolioInteractor();
            const responseObj = new JSONRequest(JSON.stringify({
                request: {
                    portfolio: {
                        name: name,
                        description: description,
                        userId: user.response.response.results[0].userId,
                        isDefault: defaultPortfolio ? 1 : 0
                    }
                }
            }));
            window.console.log(responseObj);

            const response = await interactor.post(responseObj);
        };

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
                <button onClick={handleSubmit}>Create Portfolio</button>
            </>
        );
    }
    export { PortfolioCreation };
