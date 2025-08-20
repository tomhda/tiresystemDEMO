import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentImage, setCurrentImage] = useState(null);
  const [extractedSpecs, setExtractedSpecs] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetState = () => {
    setCurrentImage(null);
    setExtractedSpecs(null);
    setRecommendations(null);
    setError(null);
  };

  const value = {
    currentImage,
    setCurrentImage,
    extractedSpecs,
    setExtractedSpecs,
    recommendations,
    setRecommendations,
    loading,
    setLoading,
    error,
    setError,
    resetState
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};