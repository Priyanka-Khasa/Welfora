import React from 'react';
import './ChatBot.css'; // Assuming you have a CSS file for styles

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
};

export default Loader;
