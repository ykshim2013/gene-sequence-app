import React, { useState, useMemo } from 'react';
import './AllelicVariantsTable.css';

const AllelicVariantsTable = ({ variants, geneName }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const variantsPerPage = 10;

  // Process and format variants data
  const processedVariants = useMemo(() => {
    if (!variants || !Array.isArray(variants)) return [];
    
    return variants.map((variant, index) => {
      // Extract variant information from OMIM structure
      const allelicVariant = variant.allelicVariant || variant;
      
      return {
        id: index + 1,
        number: allelicVariant.alternativeTitle || allelicVariant.number || `${index + 1}`,
        name: allelicVariant.name || allelicVariant.title || 'Unknown variant',
        mutation: allelicVariant.mutations?.[0]?.mutation || 
                 allelicVariant.mutation || 
                 'Mutation details not available',
        phenotype: allelicVariant.phenotypes?.[0]?.phenotype || 
                  allelicVariant.phenotype || 
                  'Phenotype information not available',
        inheritance: allelicVariant.inheritance || 'Unknown',
        clinicalSignificance: allelicVariant.clinicalSignificance || 
                             allelicVariant.significance || 
                             'Not specified',
        omimId: allelicVariant.mimNumber || allelicVariant.omimId,
        rawData: variant // Keep original data for reference
      };
    });
  }, [variants]);

  // Filter variants based on search query
  const filteredVariants = useMemo(() => {
    if (!searchQuery) return processedVariants;
    
    const query = searchQuery.toLowerCase();
    return processedVariants.filter(variant =>
      variant.name.toLowerCase().includes(query) ||
      variant.mutation.toLowerCase().includes(query) ||
      variant.phenotype.toLowerCase().includes(query) ||
      variant.number.toString().toLowerCase().includes(query)
    );
  }, [processedVariants, searchQuery]);

  // Sort variants
  const sortedVariants = useMemo(() => {
    if (!sortConfig.key) return filteredVariants;
    
    return [...filteredVariants].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle numeric sorting
      if (sortConfig.key === 'number' || sortConfig.key === 'id') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredVariants, sortConfig]);

  // Paginate variants
  const paginatedVariants = useMemo(() => {
    const startIndex = (currentPage - 1) * variantsPerPage;
    return sortedVariants.slice(startIndex, startIndex + variantsPerPage);
  }, [sortedVariants, currentPage]);

  const totalPages = Math.ceil(sortedVariants.length / variantsPerPage);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const formatMutation = (mutation) => {
    if (!mutation || mutation === 'Mutation details not available') {
      return mutation;
    }
    
    // Truncate long mutation descriptions
    if (mutation.length > 100) {
      return mutation.substring(0, 100) + '...';
    }
    
    return mutation;
  };

  const formatPhenotype = (phenotype) => {
    if (!phenotype || phenotype === 'Phenotype information not available') {
      return phenotype;
    }
    
    // Truncate long phenotype descriptions
    if (phenotype.length > 150) {
      return phenotype.substring(0, 150) + '...';
    }
    
    return phenotype;
  };

  if (!variants || variants.length === 0) {
    return (
      <div className="allelic-variants-table">
        <div className="variants-header">
          <h3>OMIM Allelic Variants</h3>
        </div>
        <div className="no-variants">
          <p>No allelic variants found for {geneName}</p>
          <small>This gene may not have documented allelic variants in OMIM, or the data may not be available.</small>
        </div>
      </div>
    );
  }

  return (
    <div className="allelic-variants-table">
      <div className="variants-header">
        <h3>OMIM Allelic Variants</h3>
        <div className="variants-controls">
          <input
            type="text"
            placeholder="Search variants..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="search-input"
          />
          <span className="variant-count">
            {filteredVariants.length} variant{filteredVariants.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      <div className="table-container">
        <table className="variants-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('number')} className="sortable">
                Variant # {getSortIcon('number')}
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                Name {getSortIcon('name')}
              </th>
              <th onClick={() => handleSort('mutation')} className="sortable">
                Mutation {getSortIcon('mutation')}
              </th>
              <th onClick={() => handleSort('phenotype')} className="sortable">
                Phenotype {getSortIcon('phenotype')}
              </th>
              <th onClick={() => handleSort('clinicalSignificance')} className="sortable">
                Significance {getSortIcon('clinicalSignificance')}
              </th>
              <th>Links</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVariants.map((variant) => (
              <tr key={variant.id}>
                <td className="variant-number">{variant.number}</td>
                <td className="variant-name" title={variant.name}>
                  {variant.name}
                </td>
                <td className="variant-mutation" title={variant.mutation}>
                  {formatMutation(variant.mutation)}
                </td>
                <td className="variant-phenotype" title={variant.phenotype}>
                  {formatPhenotype(variant.phenotype)}
                </td>
                <td className="variant-significance">
                  <span className={`significance-badge ${variant.clinicalSignificance.toLowerCase().replace(/\s+/g, '-')}`}>
                    {variant.clinicalSignificance}
                  </span>
                </td>
                <td className="variant-links">
                  {variant.omimId && (
                    <a
                      href={`https://www.omim.org/entry/${variant.omimId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="omim-link"
                      title="View in OMIM"
                    >
                      OMIM
                    </a>
                  )}
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/clinvar/?term=${encodeURIComponent(variant.name)}[variant name]`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clinvar-link"
                    title="Search in ClinVar"
                  >
                    ClinVar
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="page-button"
          >
            ← Previous
          </button>
          
          <div className="page-info">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <span className="showing-info">
              Showing {((currentPage - 1) * variantsPerPage) + 1}-{Math.min(currentPage * variantsPerPage, sortedVariants.length)} of {sortedVariants.length}
            </span>
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="page-button"
          >
            Next →
          </button>
        </div>
      )}

      <div className="table-footer">
        <small>
          Data source: Online Mendelian Inheritance in Man (OMIM)® 
          <a href="https://www.omim.org/" target="_blank" rel="noopener noreferrer">
            https://www.omim.org/
          </a>
        </small>
      </div>
    </div>
  );
};

export default AllelicVariantsTable;