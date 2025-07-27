import React, { useState, useMemo } from 'react';
import './SequenceViewer.css';

const SequenceViewer = ({ 
  sequence, 
  title, 
  isVariant = false, 
  onCopy,
  searchQuery = '',
  showLineNumbers = true,
  residuesPerLine = 50 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [highlightedPositions, setHighlightedPositions] = useState([]);
  
  const residuesPerPage = 500; // Show 10 lines per page (50 residues * 10 lines)
  
  const processedSequence = useMemo(() => {
    if (!sequence || sequence === 'Protein sequence not available') {
      return { pages: [], totalPages: 0, totalLength: 0 };
    }
    
    // Clean sequence - remove whitespace and convert to uppercase
    const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
    const totalLength = cleanSeq.length;
    const totalPages = Math.ceil(totalLength / residuesPerPage);
    
    // Split into pages
    const pages = [];
    for (let page = 0; page < totalPages; page++) {
      const start = page * residuesPerPage;
      const end = Math.min(start + residuesPerPage, totalLength);
      const pageSequence = cleanSeq.slice(start, end);
      
      // Split page sequence into lines
      const lines = [];
      for (let i = 0; i < pageSequence.length; i += residuesPerLine) {
        const lineStart = start + i;
        const lineSequence = pageSequence.slice(i, i + residuesPerLine);
        lines.push({
          sequence: lineSequence,
          startPosition: lineStart + 1, // 1-based positioning
          endPosition: lineStart + lineSequence.length
        });
      }
      
      pages.push({
        lines,
        startPosition: start + 1,
        endPosition: end
      });
    }
    
    return { pages, totalPages, totalLength };
  }, [sequence, residuesPerPage]);
  
  // Search functionality
  const searchMatches = useMemo(() => {
    if (!localSearchQuery || !sequence) return [];
    
    const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
    const searchTerm = localSearchQuery.toUpperCase();
    const matches = [];
    
    let index = cleanSeq.indexOf(searchTerm);
    while (index !== -1) {
      matches.push({
        start: index,
        end: index + searchTerm.length - 1,
        page: Math.floor(index / residuesPerPage) + 1
      });
      index = cleanSeq.indexOf(searchTerm, index + 1);
    }
    
    return matches;
  }, [localSearchQuery, sequence, residuesPerPage]);
  
  // Highlight sequence with search matches
  const highlightSequence = (lineSequence, lineStartPos) => {
    if (!localSearchQuery || !searchMatches.length) {
      return <span>{lineSequence}</span>;
    }
    
    const parts = [];
    let lastIndex = 0;
    
    searchMatches.forEach((match, matchIndex) => {
      const matchStart = match.start - (lineStartPos - 1);
      const matchEnd = match.end - (lineStartPos - 1);
      
      // Check if match overlaps with current line
      if (matchStart >= 0 && matchStart < lineSequence.length) {
        // Add text before match
        if (matchStart > lastIndex) {
          parts.push(
            <span key={`before-${matchIndex}`}>
              {lineSequence.slice(lastIndex, matchStart)}
            </span>
          );
        }
        
        // Add highlighted match
        const matchText = lineSequence.slice(
          Math.max(0, matchStart), 
          Math.min(lineSequence.length, matchEnd + 1)
        );
        parts.push(
          <span key={`match-${matchIndex}`} className="highlight">
            {matchText}
          </span>
        );
        
        lastIndex = Math.min(lineSequence.length, matchEnd + 1);
      }
    });
    
    // Add remaining text
    if (lastIndex < lineSequence.length) {
      parts.push(
        <span key="after">
          {lineSequence.slice(lastIndex)}
        </span>
      );
    }
    
    return parts.length > 0 ? parts : <span>{lineSequence}</span>;
  };
  
  const handleSearch = (query) => {
    setLocalSearchQuery(query);
    if (query && searchMatches.length > 0) {
      // Jump to first match
      setCurrentPage(searchMatches[0].page);
    }
  };
  
  const jumpToMatch = (matchIndex) => {
    if (searchMatches[matchIndex]) {
      setCurrentPage(searchMatches[matchIndex].page);
    }
  };
  
  const currentPageData = processedSequence.pages[currentPage - 1];
  
  if (!sequence || sequence === 'Protein sequence not available') {
    return (
      <div className="sequence-viewer">
        <div className="sequence-header">
          <h4>{title}</h4>
        </div>
        <div className="sequence-unavailable">
          Protein sequence not available
        </div>
      </div>
    );
  }
  
  return (
    <div className={`sequence-viewer ${isVariant ? 'variant' : ''}`}>
      <div className="sequence-header">
        <div className="sequence-title">
          <h4>{title}</h4>
          <span className="sequence-stats">
            {processedSequence.totalLength} amino acids
          </span>
        </div>
        
        <div className="sequence-controls">
          <div className="search-controls">
            <input
              type="text"
              placeholder="Search sequence..."
              value={localSearchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            {searchMatches.length > 0 && (
              <div className="search-results">
                <span className="match-count">
                  {searchMatches.length} match{searchMatches.length !== 1 ? 'es' : ''}
                </span>
                <div className="match-navigation">
                  {searchMatches.slice(0, 5).map((match, index) => (
                    <button
                      key={index}
                      onClick={() => jumpToMatch(index)}
                      className="match-button"
                      title={`Position ${match.start + 1}`}
                    >
                      {match.start + 1}
                    </button>
                  ))}
                  {searchMatches.length > 5 && (
                    <span className="more-matches">+{searchMatches.length - 5} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button onClick={() => onCopy(sequence)} className="copy-button">
            Copy Full Sequence
          </button>
        </div>
      </div>
      
      {processedSequence.totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="page-button"
          >
            ← Previous
          </button>
          
          <div className="page-info">
            <span>
              Page {currentPage} of {processedSequence.totalPages}
            </span>
            <span className="position-info">
              (Positions {currentPageData?.startPosition}-{currentPageData?.endPosition})
            </span>
          </div>
          
          <button 
            onClick={() => setCurrentPage(Math.min(processedSequence.totalPages, currentPage + 1))}
            disabled={currentPage === processedSequence.totalPages}
            className="page-button"
          >
            Next →
          </button>
        </div>
      )}
      
      <div className="sequence-content">
        {currentPageData?.lines.map((line, lineIndex) => (
          <div key={lineIndex} className="sequence-line">
            {showLineNumbers && (
              <span className="line-number">
                {line.startPosition.toString().padStart(4, ' ')}
              </span>
            )}
            <span className="sequence-text">
              {highlightSequence(line.sequence, line.startPosition)}
            </span>
            <span className="end-position">
              {line.endPosition}
            </span>
          </div>
        ))}
      </div>
      
      {processedSequence.totalPages > 1 && (
        <div className="pagination-footer">
          <div className="page-selector">
            <label>Jump to page: </label>
            <select 
              value={currentPage} 
              onChange={(e) => setCurrentPage(parseInt(e.target.value))}
              className="page-select"
            >
              {Array.from({ length: processedSequence.totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceViewer;