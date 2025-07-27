import React from 'react';
import './GeneInfo.css';

const GeneInfo = ({ geneData, onReset }) => {
  if (!geneData) return null;

  const formatSequence = (sequence, maxLength = 100) => {
    if (!sequence || sequence === "Protein sequence not found" || sequence === "Protein sequence not available") {
      return sequence;
    }
    
    if (sequence.length <= maxLength) {
      return sequence;
    }
    
    return sequence.slice(0, maxLength) + '...';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  return (
    <div className="gene-info-container">
      <div className="gene-info-header">
        <h2>Gene Information: {geneData.gene_name}</h2>
        <button onClick={onReset} className="reset-button">
          New Search
        </button>
      </div>

      <div className="gene-info-content">
        {/* Basic Information */}
        <div className="info-section">
          <h3>Basic Information</h3>
          <div className="info-item">
            <strong>Gene Name:</strong> {geneData.gene_name}
          </div>
          {geneData.variant && (
            <div className="info-item">
              <strong>Variant:</strong> {geneData.variant}
            </div>
          )}
          <div className="info-item">
            <strong>Description:</strong> {geneData.description || 'No description available'}
          </div>
        </div>

        {/* Protein Sequences */}
        <div className="info-section">
          <h3>Protein Sequences</h3>
          
          {geneData.wild_type_sequence && (
            <div className="sequence-item">
              <div className="sequence-header">
                <strong>Wild Type Sequence:</strong>
                <button 
                  onClick={() => copyToClipboard(geneData.wild_type_sequence)}
                  className="copy-button"
                >
                  Copy
                </button>
              </div>
              <div className="sequence-box">
                <code>{formatSequence(geneData.wild_type_sequence)}</code>
              </div>
              {geneData.wild_type_sequence.length > 100 && (
                <small className="sequence-note">
                  Showing first 100 characters. Full length: {geneData.wild_type_sequence.length} amino acids
                </small>
              )}
            </div>
          )}

          {geneData.variant_sequence && geneData.variant_sequence !== "Invalid variant format. Use format like 'A123G'." && (
            <div className="sequence-item">
              <div className="sequence-header">
                <strong>Variant Sequence:</strong>
                <button 
                  onClick={() => copyToClipboard(geneData.variant_sequence)}
                  className="copy-button"
                >
                  Copy
                </button>
              </div>
              <div className="sequence-box variant">
                <code>{formatSequence(geneData.variant_sequence)}</code>
              </div>
            </div>
          )}

          {geneData.variant_sequence && geneData.variant_sequence.includes("Invalid variant format") && (
            <div className="error-message">
              {geneData.variant_sequence}
            </div>
          )}
        </div>

        {/* External Links */}
        <div className="info-section">
          <h3>External Resources</h3>
          <div className="links-grid">
            {geneData.uniprot_link && (
              <a 
                href={geneData.uniprot_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link uniprot"
              >
                UniProt Database
              </a>
            )}
            
            {geneData.pdb_link && (
              <a 
                href={geneData.pdb_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link pdb"
              >
                Protein Data Bank
              </a>
            )}
            
            {geneData.omim_link && geneData.omim_link !== "#" && (
              <a 
                href={geneData.omim_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link omim"
              >
                OMIM Database
              </a>
            )}
            
            {geneData.alphamissense_link && (
              <a 
                href={geneData.alphamissense_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link alphamissense"
              >
                AlphaMissense
              </a>
            )}
          </div>
        </div>

        {/* Phenotype Information */}
        {geneData.phenotype && geneData.phenotype !== "Phenotype information is not yet implemented." && (
          <div className="info-section">
            <h3>Phenotype Information</h3>
            <div className="info-item">
              {geneData.phenotype}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneInfo;