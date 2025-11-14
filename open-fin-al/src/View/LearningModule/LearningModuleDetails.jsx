// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function LearningModuleDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const [state, setState] = useState({
    pages: null,
    isLoading: true,
  });

  useEffect(() => {
    selectPageData();
  }, []);

  const selectPageData = async () => {
    try {
      const moduleId = location?.state?.moduleId;
      if (!moduleId) {
        console.error("No moduleId in location.state");
        return;
      }
      const inputData = [moduleId];
      const query =
        "SELECT * FROM LearningModulePage WHERE moduleId=? ORDER BY pageNumber ASC";
      const data = await window.database.SQLiteSelectData({ query, inputData });
      setState({ pages: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleStartClick = async () => {
    const moduleId = String(location?.state?.moduleId || "");
    if (!moduleId) return;

    try {
      const resp = await window.api.post("/api/module/start", {
        userId: 1,
        moduleId,
      });
      console.log("POST /api/module/start ->", resp.status, resp.text);
    } catch (e) {
      console.error("startModule error", e);
    }

    // Navigate to the first page after POST
    navigate("/learningModulePage", {
      state: { pages: state.pages, currentPageIndex: 0 },
    });
  };

  return (
    <div className="page">
      <div>
        <h3>{location.state?.title}</h3>
        <p>Description: {location.state?.description}</p>
        <p>Estimated Time: {location.state?.timeEstimate} minutes</p>
      </div>

      {state.isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <button className="linklike" onClick={handleStartClick}>
            Start Module
          </button>
        </div>
      )}
    </div>
  );
}
