// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React from "react";

function NewsListing({ listingData }) {
  // Format date and time from listingData
  const formatDate = (dateString) => {
    return `${dateString.substring(0,4)}-${dateString.substring(4,6)}-${dateString.substring(6,8)}`;
  };
  
  const formatTime = (timeString) => {
    return `${timeString.substring(0,2)}:${timeString.substring(2,4)}:${timeString.substring(4,6)}`;
  };

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
      </div>
    </div>
  );
}

export { NewsListing };


 