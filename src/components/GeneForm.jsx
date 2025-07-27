import React, { useState } from 'react';
import './GeneForm.css';

const GeneForm = ({ onSubmit, isLoading }) => {
  const [gene, setGene] = useState('');
  const [variant, setVariant] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!gene.trim()) {
      newErrors.gene = 'Gene name is required';
    } else if (!/^[A-Z0-9]+$/i.test(gene.trim())) {
      newErrors.gene = 'Gene name should contain only letters and numbers';
    }
    
    if (variant && !/^[A-Z]\d+[A-Z]$/i.test(variant.trim())) {
      newErrors.variant = 'Variant format should be like A123G (amino acid change)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        gene: gene.trim().toUpperCase(),
        variant: variant.trim().toUpperCase()
      });
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <div className="gene-form-container">
      <form onSubmit={handleSubmit} className="gene-form">
        <h2>Gene Sequence Lookup</h2>
        
        <div className="form-group">
          <label htmlFor="gene">Gene Name *</label>
          <input
            type="text"
            id="gene"
            value={gene}
            onChange={(e) => setGene(e.target.value)}
            placeholder="e.g., TP53, BRCA1, EGFR"
            disabled={isLoading}
            className={errors.gene ? 'error' : ''}
          />
          {errors.gene && <span className="error-message">{errors.gene}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="variant">Variant (Optional)</label>
          <input
            type="text"
            id="variant"
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            placeholder="e.g., R273H, G12D"
            disabled={isLoading}
            className={errors.variant ? 'error' : ''}
          />
          {errors.variant && <span className="error-message">{errors.variant}</span>}
          <small className="help-text">Format: OriginalAA + Position + NewAA (e.g., R273H)</small>
        </div>

        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading ? 'Looking up...' : 'Lookup Gene'}
        </button>
      </form>
    </div>
  );
};

export default GeneForm;