// Real data integration functions
async function fetchOmimData(geneName) {
  try {
    // OMIM API search for gene
    const searchUrl = `https://api.omim.org/api/entry/search?search=${geneName}&include=geneMap&format=json&apiKey=demo`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error('OMIM search failed');
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.omim?.searchResponse?.entryList?.length) {
      return null;
    }
    
    const entry = searchData.omim.searchResponse.entryList[0].entry;
    const mimNumber = entry.mimNumber;
    
    // Get detailed entry information
    const detailUrl = `https://api.omim.org/api/entry?mimNumber=${mimNumber}&include=text,allelicVariants&format=json&apiKey=demo`;
    const detailResponse = await fetch(detailUrl);
    
    if (!detailResponse.ok) {
      throw new Error('OMIM detail fetch failed');
    }
    
    const detailData = await detailResponse.json();
    const entryDetail = detailData.omim?.entryList?.[0]?.entry;
    
    return {
      mimNumber,
      title: entry.title || entryDetail?.title,
      description: entryDetail?.textSectionList?.find(section => 
        section.textSection.textSectionName === 'description'
      )?.textSection?.textSectionContent || 'No description available',
      geneSymbol: entry.geneSymbol || geneName,
      allelicVariants: entryDetail?.allelicVariantList || []
    };
  } catch (error) {
    console.error('OMIM fetch error:', error);
    return null;
  }
}

async function fetchNcbiProteinData(geneName) {
  try {
    // Search for gene in NCBI
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=${encodeURIComponent(geneName)}[Gene Name] AND human[Organism]&retmax=1&retmode=json`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error('NCBI gene search failed');
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.esearchresult?.idlist?.length) {
      return null;
    }
    
    const geneId = searchData.esearchresult.idlist[0];
    
    // Get gene summary
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${geneId}&retmode=json`;
    const summaryResponse = await fetch(summaryUrl);
    
    if (!summaryResponse.ok) {
      throw new Error('NCBI gene summary failed');
    }
    
    const summaryData = await summaryResponse.json();
    const geneInfo = summaryData.result?.[geneId];
    
    // Search for protein sequence
    const proteinSearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=protein&term=${encodeURIComponent(geneName)}[Gene Name] AND human[Organism]&retmax=1&retmode=json`;
    const proteinSearchResponse = await fetch(proteinSearchUrl);
    
    if (!proteinSearchResponse.ok) {
      throw new Error('NCBI protein search failed');
    }
    
    const proteinSearchData = await proteinSearchResponse.json();
    
    let proteinSequence = '';
    if (proteinSearchData.esearchresult?.idlist?.length) {
      const proteinId = proteinSearchData.esearchresult.idlist[0];
      
      // Get protein sequence
      const seqUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=protein&id=${proteinId}&rettype=fasta&retmode=text`;
      const seqResponse = await fetch(seqUrl);
      
      if (seqResponse.ok) {
        const fastaData = await seqResponse.text();
        // Extract sequence from FASTA format
        const lines = fastaData.split('\n');
        proteinSequence = lines.slice(1).join('').replace(/\s/g, '');
      }
    }
    
    return {
      geneId,
      symbol: geneInfo?.name || geneName,
      description: geneInfo?.summary || 'No description available',
      chromosome: geneInfo?.chromosome,
      proteinSequence: proteinSequence || 'Protein sequence not available'
    };
  } catch (error) {
    console.error('NCBI fetch error:', error);
    return null;
  }
}

export default async function handler(req, res) {
  // Secure CORS headers - only allow specific origins in production
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://gene-sequence-app.vercel.app', 'https://ykshim2013.github.io'] 
    : ['http://localhost:3000', 'http://localhost:8080'];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const { gene, variant } = req.body;
    
    // Input validation and sanitization
    if (!gene || typeof gene !== 'string') {
      res.status(400).json({ error: 'Gene name is required and must be a string.' });
      return;
    }
    
    // Sanitize gene name - only allow alphanumeric characters and common gene symbols
    const sanitizedGene = gene.trim().replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    
    if (!sanitizedGene || sanitizedGene.length === 0) {
      res.status(400).json({ error: 'Invalid gene name format.' });
      return;
    }
    
    if (sanitizedGene.length > 20) {
      res.status(400).json({ error: 'Gene name too long (max 20 characters).' });
      return;
    }
    
    // Validate variant format if provided
    let sanitizedVariant = '';
    if (variant && typeof variant === 'string') {
      sanitizedVariant = variant.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      
      // Check basic variant format (e.g., R273H)
      if (sanitizedVariant && !/^[A-Z]\d+[A-Z]$/.test(sanitizedVariant)) {
        res.status(400).json({ error: 'Invalid variant format. Use format like R273H.' });
        return;
      }
      
      if (sanitizedVariant.length > 10) {
        res.status(400).json({ error: 'Variant name too long (max 10 characters).' });
        return;
      }
    }
    
    const geneName = sanitizedGene;
    
    // Fetch real data from OMIM and NCBI
    const [omimData, ncbiData] = await Promise.all([
      fetchOmimData(geneName),
      fetchNcbiProteinData(geneName)
    ]);
    
    // Generate variant sequence if variant provided
    let variantSequence = '';
    if (sanitizedVariant && ncbiData?.proteinSequence) {
      // Parse variant (e.g., R273H)
      const variantMatch = sanitizedVariant.match(/^([A-Z])(\d+)([A-Z])$/);
      if (variantMatch) {
        const [, fromAA, position, toAA] = variantMatch;
        const pos = parseInt(position) - 1; // Convert to 0-based indexing
        
        if (pos >= 0 && pos < ncbiData.proteinSequence.length) {
          const sequenceArray = ncbiData.proteinSequence.split('');
          if (sequenceArray[pos] === fromAA) {
            sequenceArray[pos] = toAA;
            variantSequence = sequenceArray.join('');
          } else {
            variantSequence = `Error: Position ${position} contains ${sequenceArray[pos]}, not ${fromAA}`;
          }
        } else {
          variantSequence = `Error: Position ${position} is out of range for this protein sequence`;
        }
      }
    }
    
    // Prepare response with real data
    const responseData = {
      gene_name: geneName,
      variant: sanitizedVariant,
      
      // Basic Information from OMIM
      omim_number: omimData?.mimNumber || null,
      title: omimData?.title || ncbiData?.symbol || geneName,
      description: omimData?.description || ncbiData?.description || 'No description available from OMIM or NCBI',
      chromosome: ncbiData?.chromosome || 'Unknown',
      
      // Protein Sequences
      wild_type_sequence: ncbiData?.proteinSequence || 'Protein sequence not available',
      variant_sequence: variantSequence,
      
      // External Database Links (direct search results)
      omim_link: omimData?.mimNumber ? `https://www.omim.org/entry/${omimData.mimNumber}` : `https://www.omim.org/search/?search=${geneName}`,
      uniprot_link: `https://www.uniprot.org/uniprotkb?query=gene:${geneName}+AND+organism_id:9606`,
      pdb_link: `https://www.rcsb.org/search?request=%7B%22query%22%3A%7B%22type%22%3A%22terminal%22%2C%22service%22%3A%22text%22%2C%22parameters%22%3A%7B%22attribute%22%3A%22rcsb_entity_source_organism.taxonomy_lineage.name%22%2C%22value%22%3A%22Homo%20sapiens%22%2C%22operator%22%3A%22exact_match%22%7D%7D%2C%22return_type%22%3A%22entry%22%2C%22request_options%22%3A%7B%22pager%22%3A%7B%22start%22%3A0%2C%22rows%22%3A25%7D%2C%22scoring_strategy%22%3A%22combined%22%2C%22sort%22%3A%5B%7B%22sort_by%22%3A%22score%22%2C%22direction%22%3A%22desc%22%7D%5D%7D%7D&q=${geneName}`,
      alphamissense_link: `https://alphamissense.hegelab.org/search?query=${geneName}`,
      clinvar_link: `https://www.ncbi.nlm.nih.gov/clinvar/?term=${geneName}[gene]`,
      
      // Allelic Variants from OMIM
      allelic_variants: omimData?.allelicVariants || [],
      
      // Data source indicators
      data_sources: {
        omim_available: !!omimData,
        ncbi_available: !!ncbiData,
        sequence_available: !!(ncbiData?.proteinSequence && ncbiData.proteinSequence !== 'Protein sequence not available')
      }
    };
    
    res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
}