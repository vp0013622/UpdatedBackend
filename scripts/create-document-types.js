import fetch from 'node-fetch';

async function createDocumentTypes() {
    try {
        console.log('Creating default document types...');
        
        const response = await fetch('http://localhost:8080/api/setup/documenttypes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Success:', data.message);
            console.log('📄 Document types created successfully');
        } else {
            console.log('❌ Error:', data.message);
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
        console.log('Make sure your backend server is running on port 8080');
    }
}

createDocumentTypes(); 