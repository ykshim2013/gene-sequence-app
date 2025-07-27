#!/usr/bin/env python3
"""
간단한 유전자 정보 조회 앱 - XML 파싱 문제 없는 버전
"""

from flask import Flask, render_template, request, jsonify
import requests
import json

app = Flask(__name__)

def get_gene_info_simple(gene_name):
    """간단한 유전자 정보 조회 - 외부 API 의존성 최소화"""
    
    # 기본 정보 제공
    gene_info = {
        'gene_name': gene_name.upper(),
        'description': f'{gene_name.upper()} gene information',
        'omim_link': f"https://www.omim.org/search/?search={gene_name}",
        'uniprot_link': f"https://www.uniprot.org/uniprot/?query={gene_name}&sort=score",
        'pdb_link': f"https://www.rcsb.org/search?request=%7B%22query%22%3A%7B%22type%22%3A%22group%22%2C%22logical_operator%22%3A%22and%22%2C%22nodes%22%3A%5B%7B%22type%22%3A%22terminal%22%2C%22service%22%3A%22text%22%2C%22parameters%22%3A%7B%22attribute%22%3A%22struct_keywords.pdbx_description%22%2C%22operator%22%3A%22contains_phrase%22%2C%22value%22%3A%22{gene_name}%22%7D%7D%5D%7D%2C%22return_type%22%3A%22entry%22%2C%22request_options%22%3A%7B%22pager%22%3A%7B%22start%22%3A0%2C%22rows%22%3A25%7D%2C%22scoring_strategy%22%3A%22combined%22%2C%22sort%22%3A%5B%7B%22sort_by%22%3A%22score%22%2C%22direction%22%3A%22desc%22%7D%5D%7D%7D",
        'alphamissense_link': f"https://alphamissense.hegelab.org/search?query={gene_name}",
        'phenotype': f'Phenotype information for {gene_name.upper()} - please check external databases.',
        'wild_type_sequence': f'Protein sequence for {gene_name.upper()} - please use external databases for actual sequence data.',
        'variant_sequence': ''
    }
    
    # 일반적인 유전자 정보 추가
    common_genes = {
        'MSH2': {
            'description': 'MSH2 (MutS homolog 2) is a DNA mismatch repair gene. Mutations in MSH2 are associated with Lynch syndrome and hereditary nonpolyposis colorectal cancer.',
            'phenotype': 'Lynch syndrome, hereditary nonpolyposis colorectal cancer, endometrial cancer predisposition'
        },
        'BRCA1': {
            'description': 'BRCA1 (Breast Cancer gene 1) is a tumor suppressor gene involved in DNA repair. Mutations increase risk of breast and ovarian cancers.',
            'phenotype': 'Hereditary breast and ovarian cancer syndrome, increased cancer risk'
        },
        'TP53': {
            'description': 'TP53 (Tumor Protein 53) is a crucial tumor suppressor gene known as the "guardian of the genome". It regulates cell cycle and prevents cancer formation.',
            'phenotype': 'Li-Fraumeni syndrome, increased risk of various cancers'
        },
        'CFTR': {
            'description': 'CFTR (Cystic Fibrosis Transmembrane Conductance Regulator) is involved in chloride transport. Mutations cause cystic fibrosis.',
            'phenotype': 'Cystic fibrosis, respiratory and digestive problems'
        }
    }
    
    gene_upper = gene_name.upper()
    if gene_upper in common_genes:
        gene_info.update(common_genes[gene_upper])
    
    return gene_info, None

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

    gene_info, error = get_gene_info_simple(gene_name)

    if error:
        return jsonify({"error": error}), 500
        
    gene_info['variant'] = variant
    
    # Handle variant (simplified)
    if variant and variant.strip():
        gene_info['variant_sequence'] = f'Variant sequence for {gene_name.upper()} {variant} - please use specialized tools for variant analysis.'
    else:
        gene_info['variant_sequence'] = ''

    return jsonify(gene_info)

if __name__ == "__main__":
    print("🧬 Simple Gene Information Server")
    print("Server starting on http://localhost:9001")
    print("Open your browser to: http://localhost:9001")
    app.run(host='localhost', port=9001, debug=False)