// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const adminContainer = document.getElementById('adminContainer');
const adminPasswordInput = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const newKeyInput = document.getElementById('newKey');
const expiryDateInput = document.getElementById('expiryDate');
const keyNoteInput = document.getElementById('keyNote');
const addKeyBtn = document.getElementById('addKeyBtn');
const exportKeysBtn = document.getElementById('exportKeysBtn');
const importKeysBtn = document.getElementById('importKeysBtn');
const importFileInput = document.getElementById('importFile');
const keysTable = document.getElementById('keysTable').querySelector('tbody');

// Admin password (change this to your secure password)
const ADMIN_PASSWORD = "admin";

// Keys data
let keysData = { keys: [] };

// Initialize admin panel
function initAdminPanel() {
    // Check for existing session
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
        showAdminPanel();
    } else {
        showLogin();
    }
}

// Show login screen
function showLogin() {
    loginContainer.style.display = 'block';
    adminContainer.style.display = 'none';
}

// Show admin panel
function showAdminPanel() {
    loginContainer.style.display = 'none';
    adminContainer.style.display = 'block';
    loadKeys();
}

// Handle login
function handleLogin() {
    const password = adminPasswordInput.value.trim();
    
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
    } else {
        loginError.style.display = 'block';
        adminPasswordInput.value = '';
    }
}

// Load keys from file
function loadKeys() {
    fetch('5002d83fb7c809cb870d53ed8d1783cf/keys.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load keys');
            }
            return response.json();
        })
        .then(data => {
            keysData = data;
            renderKeysTable();
        })
        .catch(error => {
            console.error('Error loading keys:', error);
            // Create empty keys if file doesn't exist
            if (error.message.includes('404')) {
                keysData = { keys: [] };
                renderKeysTable();
            } else {
                alert('Error loading keys: ' + error.message);
            }
        });
}

// Save keys to file (simulated with download)
function saveKeys() {
    const dataStr = JSON.stringify(keysData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    return dataStr;
}

// Render keys table
function renderKeysTable() {
    keysTable.innerHTML = '';
    
    if (!keysData.keys || keysData.keys.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" style="text-align: center;">No keys found</td>`;
        keysTable.appendChild(row);
        return;
    }
    
    keysData.keys.forEach((keyObj, index) => {
        const row = document.createElement('tr');
        
        const status = keyObj.used ? 
            `<span style="color: #e74c3c;">Used</span>` : 
            `<span style="color: #2ecc71;">Active</span>`;
        
        const expiry = keyObj.expiry ? 
            new Date(keyObj.expiry).toLocaleDateString() : 
            'No expiry';
        
        row.innerHTML = `
            <td>${keyObj.key}</td>
            <td>${status}</td>
            <td>${expiry}</td>
            <td>${keyObj.note || ''}</td>
            <td>
                <button class="delete" onclick="deleteKey(${index})">Delete</button>
            </td>
        `;
        
        keysTable.appendChild(row);
    });
}

// Add new key
function addKey() {
    const key = newKeyInput.value.trim();
    const expiry = expiryDateInput.value;
    const note = keyNoteInput.value.trim();
    
    if (!key) {
        alert("Please enter a key");
        return;
    }
    
    // Check if key already exists
    if (keysData.keys.some(k => k.key === key)) {
        alert("This key already exists");
        return;
    }
    
    // Add new key
    keysData.keys.push({
        key,
        used: false,
        expiry: expiry || null,
        note: note || null
    });
    
    // Save and refresh
    const updatedData = saveKeys();
    renderKeysTable();
    
    // Clear inputs
    newKeyInput.value = '';
    expiryDateInput.value = '';
    keyNoteInput.value = '';
    
    alert("Key added successfully! Don't forget to export the updated keys file.");
}

// Delete key
function deleteKey(index) {
    if (confirm("Are you sure you want to delete this key?")) {
        keysData.keys.splice(index, 1);
        const updatedData = saveKeys();
        renderKeysTable();
    }
}

// Export keys to file
function exportKeys() {
    const dataStr = saveKeys();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = 'kurtzph_keys_' + new Date().toISOString().slice(0,10) + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
}

// Import keys from file
function importKeys(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData && Array.isArray(importedData.keys)) {
                if (confirm(`Import ${importedData.keys.length} keys? This will replace all current keys.`)) {
                    keysData = importedData;
                    renderKeysTable();
                    alert("Keys imported successfully! Don't forget to export the updated keys file.");
                }
            } else {
                alert("Invalid keys file format");
            }
        } catch (error) {
            alert("Error parsing file: " + error.message);
        }
    };
    reader.readAsText(file);
}

// Make deleteKey function available globally
window.deleteKey = deleteKey;

// Event listeners
loginBtn.addEventListener('click', handleLogin);
adminPasswordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleLogin();
    }
});

addKeyBtn.addEventListener('click', addKey);
exportKeysBtn.addEventListener('click', exportKeys);
importKeysBtn.addEventListener('click', () => importFileInput.click());
importFileInput.addEventListener('change', importKeys);

// Initialize admin panel
initAdminPanel();