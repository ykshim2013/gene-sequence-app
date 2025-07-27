import React from 'react';
import SequenceViewer from './SequenceViewer';
import AllelicVariantsTable from './AllelicVariantsTable';
import './GeneInfo.css';

const GeneInfo = ({ geneData, onReset }) => {
  if (!geneData) return null;


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
          {geneData.omim_number && (
            <div className="info-item">
              <strong>OMIM Number:</strong> {geneData.omim_number}
            </div>
          )}
          {geneData.chromosome && (
            <div className="info-item">
              <strong>Chromosome:</strong> {geneData.chromosome}
            </div>
          )}
          <div className="info-item">
            <strong>Description:</strong> {geneData.description || 'No description available'}
          </div>
          
          {/* Data source indicators */}
          {geneData.data_sources && (
            <div className="info-item data-sources">
              <strong>Data Sources:</strong>
              <div className="source-indicators">
                <span className={`source-badge ${geneData.data_sources.omim_available ? 'available' : 'unavailable'}`}>
                  OMIM {geneData.data_sources.omim_available ? '✓' : '✗'}
                </span>
                <span className={`source-badge ${geneData.data_sources.ncbi_available ? 'available' : 'unavailable'}`}>
                  NCBI {geneData.data_sources.ncbi_available ? '✓' : '✗'}
                </span>
                <span className={`source-badge ${geneData.data_sources.sequence_available ? 'available' : 'unavailable'}`}>
                  Sequence {geneData.data_sources.sequence_available ? '✓' : '✗'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Protein Sequences */}
        <div className="info-section">
          <h3>Protein Sequences</h3>
          
          {geneData.wild_type_sequence && (
            <SequenceViewer
              sequence={geneData.wild_type_sequence}
              title="Wild Type Sequence"
              isVariant={false}
              onCopy={copyToClipboard}
            />
          )}

          {geneData.variant_sequence && 
           !geneData.variant_sequence.includes("Invalid variant format") && 
           !geneData.variant_sequence.includes("Error:") && (
            <SequenceViewer
              sequence={geneData.variant_sequence}
              title={`Variant Sequence (${geneData.variant})`}
              isVariant={true}
              onCopy={copyToClipboard}
            />
          )}

          {geneData.variant_sequence && 
           (geneData.variant_sequence.includes("Invalid variant format") || 
            geneData.variant_sequence.includes("Error:")) && (
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
            
            {geneData.clinvar_link && (
              <a 
                href={geneData.clinvar_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link clinvar"
              >
                ClinVar
              </a>
            )}
          </div>
        </div>

        {/* OMIM Allelic Variants */}
        {geneData.allelic_variants && (
          <AllelicVariantsTable 
            variants={geneData.allelic_variants}
            geneName={geneData.gene_name}
          />
        )}
      </div>
    </div>
  );
};

export default GeneInfo;