export default function handler(req, res) {
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
    
    // Mock response for testing
    const mockData = {
      gene_name: geneName,
      variant: sanitizedVariant,
      description: `Mock description for ${geneName}. This is a test gene that demonstrates the functionality of the gene sequence lookup application.`,
      wild_type_sequence: "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKMFCQLAKTCPVQLWVDSTPPPGTRVRAMAIYKQSQHMTEVVRRCPHHERCSDSDGLAPPQHLIRVEGNLRVEYLDDRNTFRHSVVVPYEPPEVGSDCTTIHYNYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRNSFEVRVCACPGRDRRTEEENLRKKGEPHHELPPGSTKRALPNNTSSSPQPKKKPLDGEYFTLQIRGRERFEMFRELNEALELKDAQAGKEPGGSRAHSSHLKSKKGQSTSRHKKLMFKTEGPDSD",
      variant_sequence: sanitizedVariant ? "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKMFCQLAKTCPVQLWVDSTPPPGTRVRAMAIYKQSQHMTEVVRRCPHHERCSDSDGLAPPQHLIRVEGNLRVEYLDDRNTFRHSVVVPYEPPEVGSDCTTIHYNYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRNSFEVRVCACPGRDRRTEEENLRKKGEPHHELPPGSTKRALPNNTSSSPQPKKKPLDGEYFTLQIRGRERFEMFRELNEALELKDAQAGKEPGGSRAHSSHLKSKKGQSTSRHKKLMFKTEGPDSD" : "",
      omim_link: "https://www.omim.org/entry/191170",
      uniprot_link: `https://www.uniprot.org/uniprot/?query=${geneName}&sort=score`,
      pdb_link: `https://www.rcsb.org/search?request=%7B%22query%22%3A%7B%22type%22%3A%22group%22%2C%22logical_operator%22%3A%22and%22%2C%22nodes%22%3A%5B%7B%22type%22%3A%22terminal%22%2C%22service%22%3A%22text%22%2C%22parameters%22%3A%7B%22attribute%22%3A%22struct_keywords.pdbx_description%22%2C%22operator%22%3A%22contains_phrase%22%2C%22value%22%3A%22${geneName}%22%7D%7D%5D%7D%2C%22return_type%22%3A%22entry%22%2C%22request_options%22%3A%7B%22pager%22%3A%7B%22start%22%3A0%2C%22rows%22%3A25%7D%2C%22scoring_strategy%22%3A%22combined%22%2C%22sort%22%3A%5B%7B%22sort_by%22%3A%22score%22%2C%22direction%22%3A%22desc%22%7D%5D%7D%7D`,
      alphamissense_link: `https://alphamissense.hegelab.org/search?query=${geneName}`,
      phenotype: `Mock phenotype information for ${geneName}. This gene is associated with various cellular processes and may be linked to disease when mutated.`
    };
    
    res.status(200).json(mockData);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
}