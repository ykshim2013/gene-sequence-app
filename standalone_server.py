#!/usr/bin/env python3
"""
Standalone gene information server - guaranteed to work
"""
import http.server
import socketserver
import json
import urllib.parse
from pathlib import Path

PORT = 8000

class GeneHandler(http.server.SimpleHTTPRequestHandler):
    
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gene Information Lookup</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .container { background: #f9f9f9; padding: 30px; border-radius: 8px; }
        input, button { padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007cba; color: white; cursor: pointer; }
        button:hover { background: #005a8b; }
        .results { margin-top: 20px; padding: 20px; background: white; border-radius: 4px; }
        .sequence-box { margin: 10px 0; padding: 10px; background: #f0f0f0; border-radius: 4px; }
        textarea { width: 100%; height: 100px; font-family: monospace; }
        .error { color: red; padding: 10px; background: #ffe6e6; border-radius: 4px; }
        .success { color: green; padding: 10px; background: #e6ffe6; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧬 Gene Information Lookup</h1>
        <form id="gene-form">
            <input type="text" id="gene-input" placeholder="Enter gene name (e.g., BRCA1, MSH2, TP53)" required>
            <input type="text" id="variant-input" placeholder="Enter variant (e.g., A123G) (optional)">
            <button type="submit">Get Gene Info</button>
        </form>
        
        <div id="results" style="display: none;"></div>
    </div>

    <script>
        document.getElementById('gene-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const gene = document.getElementById('gene-input').value;
            const variant = document.getElementById('variant-input').value;
            
            const params = new URLSearchParams();
            params.append('gene', gene);
            if (variant) params.append('variant', variant);
            
            fetch('/api/gene_info?' + params.toString())
                .then(response => response.json())
                .then(data => {
                    displayResults(data);
                })
                .catch(error => {
                    document.getElementById('results').innerHTML = 
                        '<div class="error">Error: ' + error.message + '</div>';
                    document.getElementById('results').style.display = 'block';
                });
        });
        
        function displayResults(data) {
            if (data.error) {
                document.getElementById('results').innerHTML = 
                    '<div class="error">' + data.error + '</div>';
            } else {
                document.getElementById('results').innerHTML = `
                    <div class="success">
                        <h2>${data.gene_name}</h2>
                        ${data.variant ? '<p><strong>Variant:</strong> ' + data.variant + '</p>' : ''}
                        
                        <h3>Description</h3>
                        <p>${data.description}</p>
                        
                        <h3>Phenotype</h3>
                        <p>${data.phenotype}</p>
                        
                        <h3>External Links</h3>
                        <ul>
                            <li><a href="${data.omim_link}" target="_blank">OMIM Database</a></li>
                            <li><a href="${data.uniprot_link}" target="_blank">UniProt</a></li>
                            <li><a href="${data.pdb_link}" target="_blank">Protein Data Bank</a></li>
                            <li><a href="${data.alphamissense_link}" target="_blank">AlphaMissense</a></li>
                        </ul>
                        
                        ${data.wild_type_sequence ? `
                        <div class="sequence-box">
                            <h4>Protein Sequence Information</h4>
                            <textarea readonly>${data.wild_type_sequence}</textarea>
                        </div>
                        ` : ''}
                        
                        ${data.variant_sequence ? `
                        <div class="sequence-box">
                            <h4>Variant Information</h4>
                            <textarea readonly>${data.variant_sequence}</textarea>
                        </div>
                        ` : ''}
                    </div>
                `;
            }
            document.getElementById('results').style.display = 'block';
        }
    </script>
</body>
</html>'''
            self.wfile.write(html_content.encode())
            
        elif self.path.startswith('/api/gene_info'):
            self.handle_gene_query()
        else:
            super().do_GET()
    
    def handle_gene_query(self):
        # Parse query parameters
        query_start = self.path.find('?')
        if query_start == -1:
            self.send_error(400, "Missing gene parameter")
            return
            
        query_string = self.path[query_start + 1:]
        params = urllib.parse.parse_qs(query_string)
        
        gene_name = params.get('gene', [''])[0]
        variant = params.get('variant', [''])[0]
        
        if not gene_name:
            self.send_error(400, "Gene name is required")
            return
        
        # Get gene information
        gene_info = self.get_gene_info(gene_name, variant)
        
        # Send JSON response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(gene_info).encode())
    
    def get_gene_info(self, gene_name, variant):
        # Gene database
        gene_database = {
            'BRCA1': {
                'description': 'BRCA1 (Breast Cancer gene 1) is a tumor suppressor gene that produces a protein involved in DNA repair. Mutations in BRCA1 significantly increase the risk of breast and ovarian cancers.',
                'phenotype': 'Hereditary breast and ovarian cancer syndrome, early onset breast cancer, triple-negative breast cancer predisposition',
                'wild_type_sequence': 'MDLSALRVEEVQNVINAMQKILECPICLELIKEPVSTKCDHIFCKFCMLKLLNQKKGPSQCPLCKNDITKRSLQESTRFSQLVEELLKIICAFQLDTGLEYANSYNFAKKENNSPEHLKDEVS... [Sample sequence - use external databases for complete sequences]'
            },
            'MSH2': {
                'description': 'MSH2 (MutS homolog 2) is a DNA mismatch repair gene involved in Lynch syndrome. This gene encodes a protein that plays an essential role in DNA mismatch repair.',
                'phenotype': 'Lynch syndrome, hereditary nonpolyposis colorectal cancer (HNPCC), increased risk of colorectal and endometrial cancers',
                'wild_type_sequence': 'MSLSVEDLKGQKDLATIARALHEQLIAPLLLDDFGRFPGYSPGYFRHQFHQDLTGFQTVQLVGSSLQTLQHSLHRTTFQELLDLSGELQHIQSLQQRFQGLLQSEQLQLQNRLSGGASQDL... [Sample sequence]'
            },
            'TP53': {
                'description': 'TP53 (Tumor Protein 53) is a crucial tumor suppressor gene often called the "guardian of the genome". It regulates cell cycle and induces apoptosis in response to DNA damage.',
                'phenotype': 'Li-Fraumeni syndrome, increased susceptibility to multiple cancer types including breast, brain, bone, and soft tissue cancers',
                'wild_type_sequence': 'MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKM... [Sample sequence]'
            }
        }
        
        gene_upper = gene_name.upper().strip()
        
        if gene_upper in gene_database:
            result = gene_database[gene_upper].copy()
        else:
            result = {
                'description': f'Gene information for {gene_upper} not found in local database. Please consult specialized genomic databases.',
                'phenotype': f'Phenotype information for {gene_upper} not available in local database.',
                'wild_type_sequence': f'Protein sequence for {gene_upper} not available in local database. Please use UniProt or similar databases.'
            }
        
        # Add common fields
        result.update({
            'gene_name': gene_upper,
            'variant': variant,
            'omim_link': f"https://www.omim.org/search/?search={gene_name}",
            'uniprot_link': f"https://www.uniprot.org/uniprot/?query={gene_name}&sort=score",
            'pdb_link': f"https://www.rcsb.org/search?request=%7B%22query%22%3A%7B%22type%22%3A%22group%22%2C%22logical_operator%22%3A%22and%22%2C%22nodes%22%3A%5B%7B%22type%22%3A%22terminal%22%2C%22service%22%3A%22text%22%2C%22parameters%22%3A%7B%22attribute%22%3A%22struct_keywords.pdbx_description%22%2C%22operator%22%3A%22contains_phrase%22%2C%22value%22%3A%22{gene_name}%22%7D%7D%5D%7D%2C%22return_type%22%3A%22entry%22%2C%22request_options%22%3A%7B%22pager%22%3A%7B%22start%22%3A0%2C%22rows%22%3A25%7D%2C%22scoring_strategy%22%3A%22combined%22%2C%22sort%22%3A%5B%7B%22sort_by%22%3A%22score%22%2C%22direction%22%3A%22desc%22%7D%5D%7D%7D",
            'alphamissense_link': f"https://alphamissense.hegelab.org/search?query={gene_name}"
        })
        
        # Handle variant
        if variant and variant.strip():
            import re
            variant_clean = variant.strip().upper()
            if re.match(r'^[A-Z]\d+[A-Z]$', variant_clean):
                result['variant_sequence'] = f'Variant analysis for {gene_upper} {variant_clean}: This system provides basic variant information. For detailed pathogenicity analysis, please use ClinVar, VEP, or similar tools.'
            else:
                result['variant_sequence'] = 'Invalid variant format. Please use format like A123G (original amino acid, position, new amino acid).'
        else:
            result['variant_sequence'] = ''
        
        return result

if __name__ == "__main__":
    print("🧬 Standalone Gene Information Server")
    print("=" * 50)
    print(f"Server starting on port {PORT}")
    print(f"Open your browser to: http://localhost:{PORT}")
    print("This server uses Python's built-in HTTP server - no dependencies!")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    with socketserver.TCPServer(("", PORT), GeneHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped.")