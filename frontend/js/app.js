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

// State
let notes = [];
let currentNoteId = null;
let saveTimeout = null;

// Load notes when page loads
document.addEventListener('DOMContentLoaded', loadNotes);

// New note button
newNoteBtn.addEventListener('click', createNewNote);

// Auto-save on input (debounced)
noteTitle.addEventListener('input', () => autoSave());
noteContent.addEventListener('input', () => autoSave());

// Toolbar buttons
toolbarBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const command = btn.getAttribute('data-command');
        executeCommand(command);
    });
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
        }
    }
});

// Execute formatting command
function executeCommand(command) {
    document.execCommand(command, false, null);
    noteContent.focus();
}

// Load all notes from API
async function loadNotes() {
    try {
        const response = await fetch(API_URL);
        notes = await response.json();
        
        renderSidebar();
        
        // If there are notes, select the first one
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
    if (notes.length === 0) {
        sidebarNotesList.innerHTML = '<p style="padding: 12px; color: #9b9a97; font-size: 0.85rem;">No notes yet</p>';
        return;
    }

    sidebarNotesList.innerHTML = '';
    
    notes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        if (note.id === currentNoteId) {
            noteItem.classList.add('active');
        }
        
        // Get plain text from HTML for sidebar display
        const plainTitle = stripHtml(note.title) || 'Untitled';
        
        noteItem.innerHTML = `
            <div class="note-item-title">${escapeHtml(plainTitle)}</div>
            <button class="note-item-delete" onclick="deleteNote(${note.id}, event)">×</button>
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