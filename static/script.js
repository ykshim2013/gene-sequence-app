document.getElementById('gene-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const gene = document.getElementById('gene-input').value;
    const variant = document.getElementById('variant-input').value;

    const loader = document.getElementById('loader');
    const resultsContainer = document.getElementById('results-container');
    const errorContainer = document.getElementById('error-container');

    // Reset UI
    resultsContainer.style.display = 'none';
    errorContainer.innerHTML = '';
    loader.style.display = 'block';

    fetch('/get_gene_info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gene, variant }),
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'An unknown error occurred.');
        }
        return data;
    })
    .then(data => {
        resultsContainer.style.display = 'block';
        document.getElementById('gene-name').textContent = data.gene_name;
        document.getElementById('variant-name').textContent = data.variant || 'N/A';
        document.getElementById('gene-description').textContent = data.description || 'No description available.';
        document.getElementById('phenotype-info').textContent = data.phenotype;
        
        document.getElementById('omim-link').href = data.omim_link || '#';
        document.getElementById('uniprot-link').href = data.uniprot_link || '#';
        document.getElementById('pdb-link').href = data.pdb_link || '#';
        document.getElementById('alphamissense-link').href = data.alphamissense_link || '#';

        document.getElementById('wild-type-sequence').value = data.wild_type_sequence || '';
        document.getElementById('variant-sequence').value = data.variant_sequence || '';
    })
    .catch(error => {
        console.error('Error:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = error.message;
        errorContainer.appendChild(errorMessage);
    })
    .finally(() => {
        loader.style.display = 'none';
    });
});

document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const textarea = document.getElementById(targetId);
        textarea.select();
        navigator.clipboard.writeText(textarea.value).then(() => {
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            setTimeout(() => {
                this.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });
}); 