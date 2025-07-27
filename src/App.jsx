import React, { useState } from 'react';
import GeneForm from './components/GeneForm';
import GeneInfo from './components/GeneInfo';
import './App.css';

const App = () => {
  const [geneData, setGeneData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the Flask backend
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/get_gene_info' 
        : 'http://localhost:8082/get_gene_info';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch gene information');
      }
      
      const data = await response.json();
      setGeneData(data);
      
    } catch (error) {
      console.error('Gene lookup error:', error);
      setError(error.message);
      throw error; // Re-throw to let GeneForm handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGeneData(null);
    setError(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Gene Sequence Lookup</h1>
        <p>Search for gene information and protein sequences</p>
      </header>
      
      <main className="app-main">
        {!geneData ? (
          <GeneForm onSubmit={handleGeneSubmit} isLoading={isLoading} />
        ) : (
          <GeneInfo geneData={geneData} onReset={handleReset} />
        )}
        
        {error && (
          <div className="app-error">
            <p>Error: {error}</p>
            <button onClick={handleReset}>Try Again</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;