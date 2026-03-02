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
        const response = await fetch(API_URL);
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
        const plainTitle = stripHtml(note.title) || 'Untitled';

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
        title: 'Untitled',
        content: ''
    };
    
    try {
        const response = await fetch(API_URL, {
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
        const response = await fetch(API_URL, {
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
    
    const title = stripHtml(note.title) || 'Untitled';
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
        title: noteTitle.value.trim() || 'Untitled',
        content: noteContent.innerHTML // Save as HTML
    };
    
    try {
        const response = await fetch(`${API_URL}/${currentNoteId}`, {
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
        const response = await fetch(`${API_URL}/${id}/favorite`, {
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
    
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
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

// Save on page unload
window.addEventListener('beforeunload', () => {
    if (currentNoteId !== null) {
        saveCurrentNote();
    }
});

// Search input
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderSidebar();
});

// Create link from selection
function createLink() {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (!selectedText) {
        alert('Please select text first');
        return;
    }
    
    const url = prompt('Enter URL:', 'https://');
    
    if (url && url.trim() !== '' && url !== 'https://') {
        document.execCommand('createLink', false, url);
        
        // Make link open in new tab
        const links = noteContent.querySelectorAll('a');
        links.forEach(link => {
            if (!link.hasAttribute('target')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
        
        noteContent.focus();
    }
}

// Auto-linkify URLs in content
function autoLinkify() {
    const content = noteContent.innerHTML;
    
    // Regex to detect URLs
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    
    // Replace plain text URLs with links
    const linkedContent = content.replace(urlRegex, (url) => {
        // Don't linkify if already in an <a> tag
        if (content.indexOf(`href="${url}"`) !== -1) {
            return url;
        }
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
    
    if (linkedContent !== content) {
        noteContent.innerHTML = linkedContent;
        
        // Restore cursor position at the end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(noteContent);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}