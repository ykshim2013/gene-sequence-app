#!/usr/bin/env python3
"""
Working Gene Application - Fixed version without BioPython issues
"""

from flask import Flask, render_template, request, jsonify
import threading
import time
import subprocess

app = Flask(__name__)

def get_gene_info_working(gene_name):
    """Simplified gene info without NCBI dependency"""
    
    # Database of common genes with known information
    gene_database = {
        'MSH2': {
            'description': 'MSH2 (MutS homolog 2) is a DNA mismatch repair gene involved in Lynch syndrome. This gene encodes a protein that plays an essential role in DNA mismatch repair.',
            'phenotype': 'Lynch syndrome, hereditary nonpolyposis colorectal cancer (HNPCC), increased risk of colorectal and endometrial cancers',
            'omim_id': '609309',
            'wild_type_sequence': 'MSLSVEDLKGQKDLATIARALHEQLIAPLLLDDFGRFPGYSPGYFRHQFHQDLTGFQTVQLVGSSLQTLQHSLHRTTFQELLDLSGELQHIQSLQQRFQGLLQSEQLQLQNRLSGGASQDL...[Truncated for display - normally would be full protein sequence]'
        },
        'BRCA1': {
            'description': 'BRCA1 (Breast Cancer gene 1) is a tumor suppressor gene that produces a protein involved in DNA repair. Mutations in BRCA1 significantly increase the risk of breast and ovarian cancers.',
            'phenotype': 'Hereditary breast and ovarian cancer syndrome, early onset breast cancer, triple-negative breast cancer predisposition',
            'omim_id': '113705',
            'wild_type_sequence': 'MDLSALRVEEVQNVINAMQKILECPICLELIKEPVSTKCDHIFCKFCMLKLLNQKKGPSQCPLCKNDITKRSLQESTRFSQLVEELLKIICAFQLDTGLEYANSYNFAKKENNSPEHLKDEVS...[Truncated for display]'
        },
        'TP53': {
            'description': 'TP53 (Tumor Protein 53) is a crucial tumor suppressor gene often called the "guardian of the genome". It regulates cell cycle and induces apoptosis in response to DNA damage.',
            'phenotype': 'Li-Fraumeni syndrome, increased susceptibility to multiple cancer types including breast, brain, bone, and soft tissue cancers',
            'omim_id': '191170',
            'wild_type_sequence': 'MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKM...[Truncated for display]'
        },
        'CFTR': {
            'description': 'CFTR (Cystic Fibrosis Transmembrane Conductance Regulator) encodes a chloride channel protein. Mutations cause cystic fibrosis.',
            'phenotype': 'Cystic fibrosis, chronic lung infections, pancreatic insufficiency, male infertility',
            'omim_id': '602421',
            'wild_type_sequence': 'MQRSPLEKASVVSKLFFSWTRPILRKGYRQRLELSDIYQIPSVDSADNLSEKLEREWDRELASKKNPKLINALRRCFFWRFMFYGIFLYLGEVTKAVQPLLLGRIIASYDPDNKEERSIAIYLGIGLCLLFIVRTLLLHPAIFGLHHIGMQM...[Truncated for display]'
        }
    }
    
    gene_upper = gene_name.upper().strip()
    
    if gene_upper in gene_database:
        gene_data = gene_database[gene_upper].copy()
        
        # Add external links
        gene_data.update({
            'omim_link': f"https://www.omim.org/entry/{gene_data.get('omim_id', '')}",
            'uniprot_link': f"https://www.uniprot.org/uniprot/?query={gene_name}&sort=score",
            'pdb_link': f"https://www.rcsb.org/search?request=%7B%22query%22%3A%7B%22type%22%3A%22group%22%2C%22logical_operator%22%3A%22and%22%2C%22nodes%22%3A%5B%7B%22type%22%3A%22terminal%22%2C%22service%22%3A%22text%22%2C%22parameters%22%3A%7B%22attribute%22%3A%22struct_keywords.pdbx_description%22%2C%22operator%22%3A%22contains_phrase%22%2C%22value%22%3A%22{gene_name}%22%7D%7D%5D%7D%2C%22return_type%22%3A%22entry%22%2C%22request_options%22%3A%7B%22pager%22%3A%7B%22start%22%3A0%2C%22rows%22%3A25%7D%2C%22scoring_strategy%22%3A%22combined%22%2C%22sort%22%3A%5B%7B%22sort_by%22%3A%22score%22%2C%22direction%22%3A%22desc%22%7D%5D%7D%7D",
            'alphamissense_link': f"https://alphamissense.hegelab.org/search?query={gene_name}"
        })
        
        return gene_data, None
    else:
        # Return basic info for unknown genes
        return {
            'description': f'Gene information for {gene_upper} not found in local database. This is a basic gene lookup system.',
            'phenotype': f'Phenotype information for {gene_upper} not available in local database. Please consult specialized databases.',
            'omim_link': f"https://www.omim.org/search/?search={gene_name}",
            'uniprot_link': f"https://www.uniprot.org/uniprot/?query={gene_name}&sort=score",
            'pdb_link': f"https://www.rcsb.org/search?request=%7B%22query%22%3A%7B%22type%22%3A%22group%22%2C%22logical_operator%22%3A%22and%22%2C%22nodes%22%3A%5B%7B%22type%22%3A%22terminal%22%2C%22service%22%3A%22text%22%2C%22parameters%22%3A%7B%22attribute%22%3A%22struct_keywords.pdbx_description%22%2C%22operator%22%3A%22contains_phrase%22%2C%22value%22%3A%22{gene_name}%22%7D%7D%5D%7D%2C%22return_type%22%3A%22entry%22%2C%22request_options%22%3A%7B%22pager%22%3A%7B%22start%22%3A0%2C%22rows%22%3A25%7D%2C%22scoring_strategy%22%3A%22combined%22%2C%22sort%22%3A%5B%7B%22sort_by%22%3A%22score%22%2C%22direction%22%3A%22desc%22%7D%5D%7D%7D",
            'alphamissense_link': f"https://alphamissense.hegelab.org/search?query={gene_name}",
            'wild_type_sequence': f'Protein sequence for {gene_upper} not available in local database. Please use external resources like UniProt.'
        }, None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_gene_info', methods=['POST'])
def get_gene_info_route():
    data = request.get_json()
    gene_name = data.get('gene')
    variant = data.get('variant')

    if not gene_name:
        return jsonify({"error": "Gene name is required."}), 400

    gene_info, error = get_gene_info_working(gene_name)

    if error:
        return jsonify({"error": error}), 500
        
    gene_info['gene_name'] = gene_name.upper()
    gene_info['variant'] = variant
    
    # Handle variant analysis (simplified)
    if variant and variant.strip():
        # Basic variant format validation
        import re
        variant_clean = variant.strip().upper()
        if re.match(r'^[A-Z]\d+[A-Z]$', variant_clean):
            gene_info['variant_sequence'] = f'Variant analysis for {gene_name.upper()} {variant_clean}: This system provides basic variant information. For detailed variant analysis, please use specialized tools like VEP, SIFT, or PolyPhen.'
        else:
            gene_info['variant_sequence'] = 'Invalid variant format. Please use format like A123G (original amino acid, position, new amino acid).'
    else:
        gene_info['variant_sequence'] = ''

    return jsonify(gene_info)

def run_server():
    """Run Flask server"""
    print("🧬 Starting Gene Information Server...")
    print("Server will be available at:")
    print("  - http://localhost:8080")
    print("  - http://127.0.0.1:8080")
    
    try:
        app.run(host='0.0.0.0', port=8080, debug=False, use_reloader=False)
    except Exception as e:
        print(f"❌ Server error: {e}")

def test_connection():
    """Test if server is responding"""
    time.sleep(3)  # Wait for server to start
    
    print("\n🔍 Testing server connection...")
    try:
        result = subprocess.run(['curl', '-s', 'http://localhost:8080'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("✅ Server connection successful!")
            print("🌐 You can now open http://localhost:8080 in your browser")
        else:
            print(f"❌ Connection test failed: {result.stderr}")
    except Exception as e:
        print(f"❌ Connection test error: {e}")

if __name__ == "__main__":
    print("🧬 Gene Information Application")
    print("=" * 50)
    
    # Start server in background thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Test connection
    test_thread = threading.Thread(target=test_connection, daemon=True)
    test_thread.start()
    
    # Keep application running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Application stopped.")