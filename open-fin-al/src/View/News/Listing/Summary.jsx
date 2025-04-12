// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React from "react";

function NewsListingSummary(props) {
  // Format date and time from listingData
  const formatDate = (dateString) => {
    return `${dateString.substring(0,4)}-${dateString.substring(4,6)}-${dateString.substring(6,8)}`;
  };
  
  const formatTime = (timeString) => {
    return `${timeString.substring(0,2)}:${timeString.substring(2,4)}:${timeString.substring(4,6)}`;
  };

  return (
    <div className="news-summary-modal">    
        <div className="news-summary-content">
            <div className="news-summary-header">
                <h2>{props.listingData.title}</h2>
                {props.onClose && <button onClick={props.onClose}>Close</button>}
            </div>
            <p>
            {props.listingData.articleText}
            </p>
            <p>
            {formatDate(props.listingData.date)} {formatTime(props.listingData.time)} - Src: {props.listingData.source}
            </p>  
        </div>
    </div>
  );
}

export { NewsListingSummary };


 