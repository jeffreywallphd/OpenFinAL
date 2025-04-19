// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, {useState} from "react";
import {NewsListingSummary} from "./Listing/Summary";
import { LanguageModelInteractor } from "../../Interactor/LanguageModelInteractor";
import { JSONRequest } from "../../Gateway/Request/JSONRequest";

function NewsListing({ listingData, state }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Format date and time from listingData
  const formatDate = (dateString) => {
    return `${dateString.substring(0,4)}-${dateString.substring(4,6)}-${dateString.substring(6,8)}`;
  };
  
  const formatTime = (timeString) => {
    return `${timeString.substring(0,2)}:${timeString.substring(2,4)}:${timeString.substring(4,6)}`;
  };
  
  const config = state.config;

  return (
    <div className="news-item">
      <div className="news-item-image" style={{ marginRight: '10px' }}>
        <img src={listingData.thumbnail} alt="Thumbnail" style={{ width: '200px', height: 'auto', borderRadius: '4px' }} />
      </div>
      <div style={{ flex: 1 }}>
        <h4 className="news-item-link" style={{ margin: '0' }} onClick={() => window.urlWindow.openUrlWindow(listingData.url)}>{listingData.title}</h4>
        <p style={{ margin: '5px 0' }}>{listingData.summary}</p>
        <p style={{ fontSize: '0.8rem', color: '#555' }}>
          {formatDate(listingData.date)} {formatTime(listingData.time)} - Src: {listingData.source}
        </p>
        <div className="news-item-actions">
          <button onClick={async () => {
            setIsLoading(true);
            const text = await window.puppetApi.getPageText(listingData.url);
            //const text = await window.urlWindow.getUrlBodyTextHidden(listingData.url);
            
            if(text) {
              var interactor = new LanguageModelInteractor();

              var message = `Please provide a summary of the following investment news article: ${text.replace(/[^a-zA-Z0-9 ]/g, "")}`;
              var requestObj = new JSONRequest(`{
                  "request": {
                      "action": "getNewsSummary",
                      "model": {
                          "name":"${config.NewsSummaryModelSettings.NewsSummaryModelName}",
                          "messages": [
                              {
                                  "role": "user",
                                  "content": "${message}"
                              }
                          ]
                      }
                  }
              }`);

              var response = await interactor.post(requestObj);

              if(response.content) {
                listingData["articleText"] = response.content;
                openModal();
              } else {
                setMessage("The AI model failed to provide a response");
              }
              setIsLoading(false);
            } else {
              setIsLoading(false);
              setMessage("Unable to extract article text");
            }
          }}>
            Create AI Summary of Article
          </button> 
          <div className={`small-loader ${isLoading ? '' : 'hidden'}`}></div>
          <span className="error-message">{message}</span>
          {isModalOpen && (
            <>
              <div className="modal-backdrop" onClick={closeModal}></div>
              <NewsListingSummary listingData={listingData} onClose={closeModal} />
            </>
          )}
        </div>  
      </div>
    </div>
  );
}

export { NewsListing };


 