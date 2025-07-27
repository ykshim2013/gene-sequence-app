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
      // Call the backend API
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/api/get_gene_info' 
        : 'http://localhost:8082/get_gene_info';
      
      console.log('Calling API:', apiUrl);
      console.log('Data:', formData);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        
        // Fallback: Use mock data if API fails
        const mockData = {
          gene_name: formData.gene.toUpperCase(),
          variant: formData.variant || '',
          description: `Mock description for ${formData.gene.toUpperCase()}. This is a test gene that demonstrates the functionality of the gene sequence lookup application.`,
          wild_type_sequence: "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKMFCQLAKTCPVQLWVDSTPPPGTRVRAMAIYKQSQHMTEVVRRCPHHERCSDSDGLAPPQHLIRVEGNLRVEYLDDRNTFRHSVVVPYEPPEVGSDCTTIHYNYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRNSFEVRVCACPGRDRRTEEENLRKKGEPHHELPPGSTKRALPNNTSSSPQPKKKPLDGEYFTLQIRGRERFEMFRELNEALELKDAQAGKEPGGSRAHSSHLKSKKGQSTSRHKKLMFKTEGPDSD",
          variant_sequence: formData.variant ? "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKMFCQLAKTCPVQLWVDSTPPPGTRVRAMAIYKQSQHMTEVVRRCPHHERCSDSDGLAPPQHLIRVEGNLRVEYLDDRNTFRHSVVVPYEPPEVGSDCTTIHYNYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRNSFEVRVCACPGRDRRTEEENLRKKGEPHHELPPGSTKRALPNNTSSSPQPKKKPLDGEYFTLQIRGRERFEMFRELNEALELKDAQAGKEPGGSRAHSSHLKSKKGQSTSRHKKLMFKTEGPDSD" : "",
          omim_link: "https://www.omim.org/entry/191170",
          uniprot_link: `https://www.uniprot.org/uniprot/?query=${formData.gene}&sort=score`,
          pdb_link: `https://www.rcsb.org/search?request=%7B%22query%22%3A%7B%22type%22%3A%22group%22%2C%22logical_operator%22%3A%22and%22%2C%22nodes%22%3A%5B%7B%22type%22%3A%22terminal%22%2C%22service%22%3A%22text%22%2C%22parameters%22%3A%7B%22attribute%22%3A%22struct_keywords.pdbx_description%22%2C%22operator%22%3A%22contains_phrase%22%2C%22value%22%3A%22${formData.gene}%22%7D%7D%5D%7D%2C%22return_type%22%3A%22entry%22%2C%22request_options%22%3A%7B%22pager%22%3A%7B%22start%22%3A0%2C%22rows%22%3A25%7D%2C%22scoring_strategy%22%3A%22combined%22%2C%22sort%22%3A%5B%7B%22sort_by%22%3A%22score%22%2C%22direction%22%3A%22desc%22%7D%5D%7D%7D`,
          alphamissense_link: `https://alphamissense.hegelab.org/search?query=${formData.gene}`,
          phenotype: `Mock phenotype information for ${formData.gene.toUpperCase()}. This gene is associated with various cellular processes and may be linked to disease when mutated.`
        };
        
        console.log('Using fallback mock data');
        setGeneData(mockData);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch gene information');
      }
      
      const data = await response.json();
      setGeneData(data);
      
    } catch (error) {
      console.error('Gene lookup error:', error);
      
      // If all else fails, use fallback mock data
      const mockData = {
        gene_name: formData.gene.toUpperCase(),
        variant: formData.variant || '',
        description: `Fallback description for ${formData.gene.toUpperCase()}. The API is currently unavailable, but here's some mock data to demonstrate the app functionality.`,
        wild_type_sequence: "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKMFCQLAKTCPVQLWVDSTPPPGTRVRAMAIYKQSQHMTEVVRRCPHHERCSDSDGLAPPQHLIRVEGNLRVEYLDDRNTFRHSVVVPYEPPEVGSDCTTIHYNYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRNSFEVRVCACPGRDRRTEEENLRKKGEPHHELPPGSTKRALPNNTSSSPQPKKKPLDGEYFTLQIRGRERFEMFRELNEALELKDAQAGKEPGGSRAHSSHLKSKKGQSTSRHKKLMFKTEGPDSD",
        variant_sequence: formData.variant ? "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKMFCQLAKTCPVQLWVDSTPPPGTRVRAMAIYKQSQHMTEVVRRCPHHERCSDSDGLAPPQHLIRVEGNLRVEYLDDRNTFRHSVVVPYEPPEVGSDCTTIHYNYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRNSFEVRVCACPGRDRRTEEENLRKKGEPHHELPPGSTKRALPNNTSSSPQPKKKPLDGEYFTLQIRGRERFEMFRELNEALELKDAQAGKEPGGSRAHSSHLKSKKGQSTSRHKKLMFKTEGPDSD" : "",
        omim_link: "https://www.omim.org/entry/191170",
        uniprot_link: `https://www.uniprot.org/uniprot/?query=${formData.gene}&sort=score`,
        pdb_link: `https://www.rcsb.org/search?request=%7B%22query%22%3A%7B%22type%22%3A%22group%22%2C%22logical_operator%22%3A%22and%22%2C%22nodes%22%3A%5B%7B%22type%22%3A%22terminal%22%2C%22service%22%3A%22text%22%2C%22parameters%22%3A%7B%22attribute%22%3A%22struct_keywords.pdbx_description%22%2C%22operator%22%3A%22contains_phrase%22%2C%22value%22%3A%22${formData.gene}%22%7D%7D%5D%7D%2C%22return_type%22%3A%22entry%22%2C%22request_options%22%3A%7B%22pager%22%3A%7B%22start%22%3A0%2C%22rows%22%3A25%7D%2C%22scoring_strategy%22%3A%22combined%22%2C%22sort%22%3A%5B%7B%22sort_by%22%3A%22score%22%2C%22direction%22%3A%22desc%22%7D%5D%7D%7D`,
        alphamissense_link: `https://alphamissense.hegelab.org/search?query=${formData.gene}`,
        phenotype: `Fallback phenotype information for ${formData.gene.toUpperCase()}. This gene is associated with various cellular processes and may be linked to disease when mutated.`
      };
      
      console.log('Using complete fallback due to error');
      setGeneData(mockData);
      setError('API unavailable - showing demo data');
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