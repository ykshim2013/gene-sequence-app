#!/usr/bin/env python3
"""
Gene lookup test script - 웹 서버 없이 직접 테스트
"""

from app import get_protein_info

def test_gene_lookup(gene_name):
    print(f"\n=== Testing gene lookup for: {gene_name} ===")
    
    try:
        result, error = get_protein_info(gene_name)
        
        if error:
            print(f"❌ Error: {error}")
            return
            
        print("✅ Gene information retrieved successfully!")
        print(f"📝 Description: {result.get('description', 'N/A')[:100]}...")
        print(f"🔗 OMIM Link: {result.get('omim_link', 'N/A')}")
        print(f"🔗 UniProt Link: {result.get('uniprot_link', 'N/A')}")
        print(f"🧬 Sequence Length: {len(result.get('wild_type_sequence', ''))} amino acids")
        
        # Show first 50 amino acids
        sequence = result.get('wild_type_sequence', '')
        if sequence:
            print(f"🧬 First 50 AA: {sequence[:50]}...")
        
    except Exception as e:
        print(f"❌ Exception occurred: {e}")

if __name__ == "__main__":
    print("🧬 Gene Lookup Test Tool")
    print("=" * 50)
    
    # Test with common genes
    test_genes = ["MSH2", "BRCA1", "TP53"]
    
    for gene in test_genes:
        test_gene_lookup(gene)
    
    print("\n" + "=" * 50)
    print("테스트 완료! 웹 인터페이스 대신 이 스크립트를 사용할 수 있습니다.")
    print("다른 유전자를 테스트하려면:")
    print("python3 test_gene_lookup.py")