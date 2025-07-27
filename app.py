from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from Bio import Entrez
import re
import xml.etree.ElementTree as ET

app = Flask(__name__)
CORS(app)

Entrez.email = "test@example.com"  # Valid email format for NCBI

def get_protein_info(gene_name):
    try:
        # Search for the gene to get its ID
        handle = Entrez.esearch(db="gene", term=f"{gene_name}[Gene Name] AND human[Organism]", retmax="1")
        record = Entrez.read(handle)
        handle.close()
        if not record["IdList"]:
            return None, "Gene not found."

        gene_id = record["IdList"][0]

        # Fetch the gene record to find the protein RefSeq ID
        try:
            handle = Entrez.efetch(db="gene", id=gene_id, rettype="gb", retmode="xml")
            gene_records = Entrez.read(handle)
            handle.close()
        except Exception as xml_error:
            # If BioPython fails, try with raw XML parsing
            try:
                handle = Entrez.efetch(db="gene", id=gene_id, rettype="gb", retmode="xml")
                xml_data = handle.read()
                handle.close()
                
                # Parse with ElementTree
                root = ET.fromstring(xml_data)
                
                # Extract basic gene information
                gene_info = {}
                
                # Try to find summary/description
                summary_elem = root.find(".//Entrezgene_summary")
                if summary_elem is not None:
                    gene_info['description'] = summary_elem.text or "No description available"
                else:
                    gene_info['description'] = "No description available"
                
                # For now, use placeholder values and simplified approach
                gene_info['omim_link'] = "#"
                gene_info['uniprot_link'] = f"https://www.uniprot.org/uniprot/?query={gene_name}&sort=score"
                gene_info['pdb_link'] = f"https://www.rcsb.org/search?request=%7B%22query%22%3A%7B%22type%22%3A%22group%22%2C%22logical_operator%22%3A%22and%22%2C%22nodes%22%3A%5B%7B%22type%22%3A%22terminal%22%2C%22service%22%3A%22text%22%2C%22parameters%22%3A%7B%22attribute%22%3A%22struct_keywords.pdbx_description%22%2C%22operator%22%3A%22contains_phrase%22%2C%22value%22%3A%22{gene_name}%22%7D%7D%5D%7D%2C%22return_type%22%3A%22entry%22%2C%22request_options%22%3A%7B%22pager%22%3A%7B%22start%22%3A0%2C%22rows%22%3A25%7D%2C%22scoring_strategy%22%3A%22combined%22%2C%22sort%22%3A%5B%7B%22sort_by%22%3A%22score%22%2C%22direction%22%3A%22desc%22%7D%5D%7D%7D"
                gene_info['alphamissense_link'] = f"https://alphamissense.hegelab.org/search?query={gene_name}"
                gene_info['phenotype'] = "Phenotype information is not yet implemented."
                
                # Try to get protein sequence via alternative method
                try:
                    # Search for protein directly
                    protein_handle = Entrez.esearch(db="protein", term=f"{gene_name}[Gene Name] AND human[Organism]", retmax="1")
                    protein_record = Entrez.read(protein_handle)
                    protein_handle.close()
                    
                    if protein_record["IdList"]:
                        protein_id = protein_record["IdList"][0]
                        # Fetch protein sequence
                        seq_handle = Entrez.efetch(db="protein", id=protein_id, rettype="fasta", retmode="text")
                        fasta_record = seq_handle.read()
                        seq_handle.close()
                        gene_info['wild_type_sequence'] = "".join(fasta_record.splitlines()[1:])
                    else:
                        gene_info['wild_type_sequence'] = "Protein sequence not found"
                except:
                    gene_info['wild_type_sequence'] = "Protein sequence not available"
                
                return gene_info, None
                
            except Exception as e:
                return None, f"XML parsing error: {e}"

        if not gene_records:
            return None, "Could not fetch gene record from NCBI."
        
        gene_record = gene_records[0]
        
        gene_info = {}
        
        summary = gene_record.get('Entrezgene_summary', '')
        gene_info['description'] = summary

        # Extract OMIM ID from the record
        omim_id = None
        if 'Entrezgene_comments' in gene_record:
            for comment in gene_record.get('Entrezgene_comments', []):
                if comment.get('Gene-commentary_heading') == 'MIM':
                    omim_id = comment.get('Gene-commentary_text')
                    break
        
        if omim_id:
            gene_info['omim_link'] = f"https://www.omim.org/entry/{omim_id}"
        else:
            gene_info['omim_link'] = "#"
            
        # Find protein sequence
        protein_accession = None
        entrezgene_prot = gene_record.get('Entrezgene_prot')
        if entrezgene_prot and len(entrezgene_prot) > 0:
            prot_refs = entrezgene_prot[0].get('Prot-ref')
            if prot_refs:
                for product in prot_refs:
                    if product.get('Prot-ref_acronym') and product.get('Prot-ref_name'):
                        protein_accession = product.get('Prot-ref_acronym')
                        break

        if not protein_accession:
            entrezgene_locus = gene_record.get('Entrezgene_locus')
            if entrezgene_locus and len(entrezgene_locus) > 0:
                gene_commentary_list = entrezgene_locus[0].get('Gene-commentary')
                if gene_commentary_list:
                    for gene_commentary in gene_commentary_list:
                        comment_list = gene_commentary.get('Gene-commentary_comment')
                        if comment_list:
                            for comment in comment_list:
                                product_list = comment.get('Gene-commentary_products')
                                if product_list:
                                    for feature in product_list:
                                        if feature.get('Gene-commentary') and feature['Gene-commentary'].get('Gene-commentary_accession'):
                                            protein_accession = feature['Gene-commentary']['Gene-commentary_accession']
                                            break
                                if protein_accession:
                                    break
                        if protein_accession:
                            break

        if not protein_accession:
            return None, "Protein accession not found for this gene."

        # Fetch the protein record
        handle = Entrez.efetch(db="protein", id=protein_accession, rettype="fasta", retmode="text")
        fasta_record = handle.read()
        handle.close()

        gene_info['wild_type_sequence'] = "".join(fasta_record.splitlines(True)[1:])
        
        # Placeholder for other links
        gene_info['uniprot_link'] = f"https://www.uniprot.org/uniprot/?query={gene_name}&sort=score"
        gene_info['pdb_link'] = f"https://www.rcsb.org/search?request=%7B%22query%22%3A%7B%22type%22%3A%22group%22%2C%22logical_operator%22%3A%22and%22%2C%22nodes%22%3A%5B%7B%22type%22%3A%22terminal%22%2C%22service%22%3A%22text%22%2C%22parameters%22%3A%7B%22attribute%22%3A%22struct_keywords.pdbx_description%22%2C%22operator%22%3A%22contains_phrase%22%2C%22value%22%3A%22{gene_name}%22%7D%7D%5D%7D%2C%22return_type%22%3A%22entry%22%2C%22request_options%22%3A%7B%22pager%22%3A%7B%22start%22%3A0%2C%22rows%22%3A25%7D%2C%22scoring_strategy%22%3A%22combined%22%2C%22sort%22%3A%5B%7B%22sort_by%22%3A%22score%22%2C%22direction%22%3A%22desc%22%7D%5D%7D%7D"
        gene_info['alphamissense_link'] = f"https://alphamissense.hegelab.org/search?query={gene_name}"
        gene_info['phenotype'] = "Phenotype information is not yet implemented."
        
        return gene_info, None
    except Exception as e:
        return None, f"An error occurred: {e}"

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

    gene_info, error = get_protein_info(gene_name)

    if error:
        return jsonify({"error": error}), 500
        
    gene_info['gene_name'] = gene_name
    gene_info['variant'] = variant
    
    # Handle variant
    if variant and gene_info.get('wild_type_sequence'):
        match = re.match(r"([A-Z])(\d+)([A-Z])", variant.upper())
        if match:
            from_aa, pos, to_aa = match.groups()
            pos = int(pos) - 1
            wt_seq = gene_info.get('wild_type_sequence', '')
            
            if wt_seq and pos < len(wt_seq) and wt_seq[pos] == from_aa:
                variant_seq = list(wt_seq)
                variant_seq[pos] = to_aa
                gene_info['variant_sequence'] = "".join(variant_seq)
            else:
                gene_info['variant_sequence'] = "Variant position or original AA is incorrect."
        else:
            gene_info['variant_sequence'] = "Invalid variant format. Use format like 'A123G'."
    else:
        gene_info['variant_sequence'] = ""

    return jsonify(gene_info)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081, debug=True) 