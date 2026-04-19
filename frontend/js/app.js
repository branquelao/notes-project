// Get Token Function
function getToken() {
    return localStorage.getItem("token");
}

// Authentication Fetch
function authFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            'Authorization': `Bearer ${getToken()}`
        }
    }).then(response => {
        if (response.status === 401) {
            console.error("Unauthorized - invalid or expired token");
        }
        return response;
    });
}

// API Base URL
const API_URL = 'https://localhost:7269/api/Notes';

// Elements
const sidebarNotesList = document.getElementById('sidebarNotesList');
const editorPlaceholder = document.getElementById('editorPlaceholder');
const editorContent = document.getElementById('editorContent');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const newNoteBtn = document.getElementById('newNoteBtn');
const toolbarBtns = document.querySelectorAll('.toolbar-btn');
const menuBtn = document.getElementById('menuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const fontOptions = document.querySelectorAll('.font-option');
const smallTextToggle = document.getElementById('smallTextToggle');
const fullWidthToggle = document.getElementById('fullWidthToggle');
const deleteNoteOption = document.getElementById('deleteNoteOption');
const duplicateNoteOption = document.getElementById('duplicateNoteOption');
const exportNoteOption = document.getElementById('exportNoteOption');
const searchInput = document.getElementById('searchInput');
const darkModeToggle = document.getElementById('darkModeToggle');
const createLinkBtn = document.getElementById('createLinkBtn');
const insertImageBtn = document.getElementById('insertImageBtn');

// State
let notes = [];
let currentNoteId = null;
let saveTimeout = null;
let currentFont = 'default';
let isSmallText = false;
let isFullWidth = false;
let searchQuery = '';

// Load notes when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadDarkModePreference();
    loadNotes();
});

// New note button
newNoteBtn.addEventListener('click', createNewNote);

// Auto-save on input (debounced)
noteTitle.addEventListener('input', () => autoSave());
noteContent.addEventListener('input', () => autoSave());

// Handle link clicks
noteContent.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        e.preventDefault();
        window.open(e.target.href, '_blank');
    }
});

// Auto-linkify when pasting URLs
noteContent.addEventListener('paste', (e) => {
    setTimeout(() => {
        autoLinkify();
    }, 100);
});

// Toolbar buttons
toolbarBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const command = btn.getAttribute('data-command');
        executeCommand(command);
    });
});

// Create link button
createLinkBtn.addEventListener('click', (e) => {
    e.preventDefault();
    createLink();
});

// Insert image button
insertImageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    insertImage();
});

// Handle paste images
noteContent.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    
    for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            const blob = item.getAsFile();
            insertImageFromBlob(blob);
            return;
        }
    }
    
    // Auto-linkify URLs (código existente)
    setTimeout(() => {
        autoLinkify();
    }, 100);
});

// Menu button toggle
menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target) && e.target !== menuBtn) {
        dropdownMenu.classList.remove('active');
    }
});

// Font options
fontOptions.forEach(option => {
    option.addEventListener('click', () => {
        const font = option.getAttribute('data-font');
        setFont(font);
    });
});

// Small text toggle
smallTextToggle.addEventListener('change', () => {
    isSmallText = smallTextToggle.checked;
    applyTextSize();
});

// Full width toggle
fullWidthToggle.addEventListener('change', () => {
    isFullWidth = fullWidthToggle.checked;
    applyWidth();
});

// Dark mode toggle
darkModeToggle.addEventListener('change', () => {
    toggleDarkMode();
});

// Delete note option
deleteNoteOption.addEventListener('click', () => {
    if (currentNoteId) {
        dropdownMenu.classList.remove('active');
        deleteNote(currentNoteId, { stopPropagation: () => {} });
    }
});

// Duplicate note option
duplicateNoteOption.addEventListener('click', () => {
    if (currentNoteId) {
        dropdownMenu.classList.remove('active');
        duplicateNote();
    }
});

// Export note option
exportNoteOption.addEventListener('click', () => {
    if (currentNoteId) {
        dropdownMenu.classList.remove('active');
        exportNote();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Only work when editor is visible
    if (editorContent.style.display === 'none') return;
    
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'b':
                e.preventDefault();
                executeCommand('bold');
                break;
            case 'i':
                e.preventDefault();
                executeCommand('italic');
                break;
            case 'u':
                e.preventDefault();
                executeCommand('underline');
                break;
            case 'n':
                e.preventDefault();
                createNewNote();
                break;
            case 's':
                e.preventDefault();
                saveCurrentNote();
                break;
            case 'd':
                e.preventDefault();
                duplicateNote();
                break;
        }
    }
});

// Execute formatting command
function executeCommand(command) {
    document.execCommand(command, false, null);
    noteContent.focus();
}

// Set font
function setFont(font) {
    currentFont = font;
    
    // Remove active class from all options
    fontOptions.forEach(opt => opt.classList.remove('active'));
    
    // Add active class to selected option
    const selectedOption = document.querySelector(`[data-font="${font}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    // Apply font to both title and content
    noteTitle.classList.remove('font-default', 'font-serif', 'font-mono');
    noteContent.classList.remove('font-default', 'font-serif', 'font-mono');
    noteTitle.classList.add(`font-${font}`);
    noteContent.classList.add(`font-${font}`);
}

// Apply text size
function applyTextSize() {
    if (isSmallText) {
        noteContent.classList.add('small-text');
    } else {
        noteContent.classList.remove('small-text');
    }
}

// Apply width
function applyWidth() {
    const toolbar = document.querySelector('.toolbar');
    const topBar = document.querySelector('.editor-top-bar');
    const titleInput = document.querySelector('.note-title-input');
    
    if (isFullWidth) {
        toolbar.style.padding = '12px 48px';
        topBar.style.padding = '12px 48px';
        titleInput.style.margin = '20px 48px 10px 48px';
        noteContent.style.padding = '0 48px 60px 48px';
    } else {
        toolbar.style.padding = '12px 96px';
        topBar.style.padding = '12px 96px';
        titleInput.style.margin = '20px 96px 10px 96px';
        noteContent.style.padding = '0 96px 60px 96px';
    }
}

// Load all notes from API
async function loadNotes() {
    try {
        const response = await authFetch(API_URL);
        notes = await response.json();
        
        // Sort: favorites first, then by UpdatedAt (most recent first)
        notes.sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        
        renderSidebar();
        
        if (notes.length > 0 && currentNoteId === null) {
            selectNote(notes[0].id);
        }
    } catch (error) {
        console.error('Error loading notes:', error);
        sidebarNotesList.innerHTML = '<p style="padding: 12px; color: #9b9a97;">Error loading notes</p>';
    }
}

// Render sidebar notes list
function renderSidebar() {
    // Filter notes based on search query
    const filteredNotes = notes.filter(note => {
        const title = stripHtml(note.title).toLowerCase();
        const content = stripHtml(note.content).toLowerCase();
        return title.includes(searchQuery) || content.includes(searchQuery);
    });

    if (filteredNotes.length === 0) {
        if (searchQuery) {
            sidebarNotesList.innerHTML = '<p style="padding: 12px; color: #9b9a97; font-size: 0.85rem;">No notes found</p>';
        } else {
            sidebarNotesList.innerHTML = '<p style="padding: 12px; color: #9b9a97; font-size: 0.85rem;">No notes yet</p>';
        }
        return;
    }

    sidebarNotesList.innerHTML = '';
    
    filteredNotes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        if (note.id === currentNoteId) {
            noteItem.classList.add('active');
        }
        
        // Get plain text from HTML for sidebar display
        const plainTitle = stripHtml(note.title) || 'New note';

        noteItem.innerHTML = `
            <div class="note-item-content">
                <div class="note-item-title">${escapeHtml(plainTitle)}</div>
            </div>
            <div class="note-item-actions">
                <button class="note-item-favorite ${note.isFavorite ? 'active' : ''}" onclick="toggleFavorite(${note.id}, event)">
                    ${note.isFavorite ? '⭐' : '☆'}
                </button>
                <button class="note-item-delete" onclick="deleteNote(${note.id}, event)">×</button>
            </div>
        `;
        
        noteItem.addEventListener('click', () => selectNote(note.id));
        
        sidebarNotesList.appendChild(noteItem);
    });
}

// Select and display a note
async function selectNote(id) {
    // Save current note before switching
    if (currentNoteId !== null && currentNoteId !== id) {
        await saveCurrentNote();
    }
    
    currentNoteId = id;
    const note = notes.find(n => n.id === id);
    
    if (!note) return;
    
    // Show editor, hide placeholder
    editorPlaceholder.style.display = 'none';
    editorContent.style.display = 'flex';
    
    // Populate editor (support HTML content)
    noteTitle.value = stripHtml(note.title);
    noteContent.innerHTML = note.content;
    
    // Update sidebar active state
    renderSidebar();
    
    // Focus on content
    noteContent.focus();
}

// Create new note
async function createNewNote() {
    // Save current note first
    if (currentNoteId !== null) {
        await saveCurrentNote();
    }
    
    const newNote = {
        title: 'New note',
        content: ''
    };
    
    try {
        const response = await authFetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newNote)
        });
        
        if (response.ok) {
            const createdNote = await response.json();
            notes.unshift(createdNote); // Add to beginning
            selectNote(createdNote.id);
            renderSidebar();
            
            // Focus and select title for easy renaming
            noteTitle.focus();
            noteTitle.select();
        }
    } catch (error) {
        console.error('Error creating note:', error);
        alert('Error creating note. Make sure the API is running.');
    }
}

// Duplicate note
async function duplicateNote() {
    if (currentNoteId === null) return;
    
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;
    
    const duplicatedNote = {
        title: stripHtml(note.title) + ' (Copy)',
        content: note.content
    };
    
    try {
        const response = await authFetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(duplicatedNote)
        });
        
        if (response.ok) {
            const createdNote = await response.json();
            notes.unshift(createdNote);
            selectNote(createdNote.id);
            renderSidebar();
        }
    } catch (error) {
        console.error('Error duplicating note:', error);
        alert('Error duplicating note.');
    }
}

// Export note as text file
function exportNote() {
    if (currentNoteId === null) return;
    
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;
    
    const title = stripHtml(note.title) || 'New note';
    const content = stripHtml(note.content);
    const fullContent = `${title}\n\n${content}`;
    
    // Create blob and download
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Auto-save with debounce
function autoSave() {
    if (currentNoteId === null) return;
    
    // Clear previous timeout
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
    
    // Set new timeout (save after 1 second of no typing)
    saveTimeout = setTimeout(() => {
        saveCurrentNote();
    }, 1000);
}

// Save current note
async function saveCurrentNote() {
    if (currentNoteId === null) return;
    
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;
    
    const updatedNote = {
        id: currentNoteId,
        title: noteTitle.value.trim() || 'New note',
        content: noteContent.innerHTML, // Save as HTML
        isFavorite: note.IsFavorite
    };
    
    try {
        const response = await authFetch(`${API_URL}/${currentNoteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedNote)
        });
        
        if (response.ok) {
            // Update local notes array
            const index = notes.findIndex(n => n.id === currentNoteId);
            if (index !== -1) {
                notes[index] = { ...notes[index], ...updatedNote };
                renderSidebar();
            }
        }
    } catch (error) {
        console.error('Error saving note:', error);
    }
}

// Toggle favorite status
async function toggleFavorite(id, event) {
    event.stopPropagation(); // Prevent note selection
    
    try {
        const response = await authFetch(`${API_URL}/${id}/favorite`, {
            method: 'PATCH'
        });
        
        if (response.ok) {
            const updatedNote = await response.json();
            
            // Update local notes array
            const index = notes.findIndex(n => n.id === id);
            if (index !== -1) {
                notes[index] = updatedNote;
                
                // Re-sort: favorites first, then by UpdatedAt
                notes.sort((a, b) => {
                    if (a.isFavorite && !b.isFavorite) return -1;
                    if (!a.isFavorite && b.isFavorite) return 1;
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                });
                
                renderSidebar();
            }
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('Error updating favorite status.');
    }
}

// Delete note
async function deleteNote(id, event) {
    event.stopPropagation(); // Prevent note selection
    
    try {
        const response = await authFetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Remove from notes array
            notes = notes.filter(n => n.id !== id);
            
            // If deleted note was selected, clear editor
            if (currentNoteId === id) {
                currentNoteId = null;
                editorPlaceholder.style.display = 'flex';
                editorContent.style.display = 'none';
                noteTitle.value = '';
                noteContent.innerHTML = '';
                
                // Select first note if available
                if (notes.length > 0) {
                    selectNote(notes[0].id);
                }
            }
            
            renderSidebar();
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Error deleting note. Make sure the API is running.');
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Load dark mode preference on page load
function loadDarkModePreference() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
}

// Insert image via file picker
function insertImage() {
    // Create hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            insertImageFromBlob(file);
        }
    };
    
    input.click();
}

// Insert image from blob/file
function insertImageFromBlob(blob) {
    // Check file size (max 5MB)
    if (blob.size > 5 * 1024 * 1024) {
        alert('Image too large. Maximum size is 5MB.');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const base64 = e.target.result;
        
        // Create image element
        const img = document.createElement('img');
        img.src = base64;
        img.alt = 'Uploaded image';
        img.style.maxWidth = '100%';
        
        // Insert at cursor position
        insertNodeAtCursor(img);
        
        // Add line break after image
        const br = document.createElement('br');
        insertNodeAtCursor(br);
        
        // Trigger auto-save
        noteContent.dispatchEvent(new Event('input'));
    };
    
    reader.readAsDataURL(blob);
}

// Insert node at cursor position
function insertNodeAtCursor(node) {
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(node);
        
        // Move cursor after inserted node
        range.setStartAfter(node);
        range.setEndAfter(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        // If no selection, append to end
        noteContent.appendChild(node);
    }
    
    noteContent.focus();
}

// Handle image clicks (optional - for future features like delete/resize)
noteContent.addEventListener('click', (e) => {
    // Handle link clicks (código existente)
    if (e.target.tagName === 'A') {
        e.preventDefault();
        window.open(e.target.href, '_blank');
        return;
    }
    
    // Handle image clicks
    if (e.target.tagName === 'IMG') {
        // Toggle selection
        const wasSelected = e.target.classList.contains('selected');
        
        // Remove selection from all images
        noteContent.querySelectorAll('img').forEach(img => {
            img.classList.remove('selected');
        });
        
        // Toggle current image
        if (!wasSelected) {
            e.target.classList.add('selected');
        }
    }
});

// Deselect images when clicking elsewhere
noteContent.addEventListener('click', (e) => {
    if (e.target.tagName !== 'IMG') {
        noteContent.querySelectorAll('img').forEach(img => {
            img.classList.remove('selected');
        });
    }
});

// Delete selected image with Delete key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedImg = noteContent.querySelector('img.selected');
        if (selectedImg) {
            e.preventDefault();
            selectedImg.remove();
            noteContent.dispatchEvent(new Event('input'));
        }
    }
});

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

// Search input
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderSidebar();
});