// API Base URL
const API_URL = 'https://localhost:7269/api/Notes';

// Elements
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const saveBtn = document.getElementById('saveBtn');
const notesList = document.getElementById('notesList');

// Load notes when page loads
document.addEventListener('DOMContentLoaded', loadNotes);

// Save button click
saveBtn.addEventListener('click', saveNote);

// Load all notes from API
async function loadNotes() {
    try {
        const response = await fetch(API_URL);
        const notes = await response.json();
        
        displayNotes(notes);
    } catch (error) {
        console.error('Error loading notes:', error);
        notesList.innerHTML = '<p>Error loading notes. Make sure the API is running.</p>';
    }
}

// Display notes on page
function displayNotes(notes) {
    if (notes.length === 0) {
        notesList.innerHTML = '<p>No notes yet. Create your first note!</p>';
        return;
    }

    notesList.innerHTML = '';
    
    notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.innerHTML = `
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(note.content)}</p>
            <div class="note-date">${formatDate(note.createdAt)}</div>
            <div class="note-actions">
                <button class="edit-btn" onclick="editNote(${note.id})">Edit</button>
                <button class="delete-btn" onclick="deleteNote(${note.id})">Delete</button>
            </div>
        `;
        
        notesList.appendChild(noteCard);
    });
}

// Save new note
async function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (!title || !content) {
        alert('Please fill in both title and content');
        return;
    }
    
    const note = {
        title: title,
        content: content
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(note)
        });
        
        if (response.ok) {
            noteTitle.value = '';
            noteContent.value = '';
            loadNotes();
        } else {
            alert('Error saving note');
        }
    } catch (error) {
        console.error('Error saving note:', error);
        alert('Error saving note. Make sure the API is running.');
    }
}

// Delete note
async function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadNotes();
        } else {
            alert('Error deleting note');
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Error deleting note. Make sure the API is running.');
    }
}

// Edit note (simplified version - you can improve this)
async function editNote(id) {
    const newTitle = prompt('Enter new title:');
    const newContent = prompt('Enter new content:');
    
    if (!newTitle || !newContent) {
        return;
    }
    
    const note = {
        id: id,
        title: newTitle,
        content: newContent
    };
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(note)
        });
        
        if (response.ok) {
            loadNotes();
        } else {
            alert('Error updating note');
        }
    } catch (error) {
        console.error('Error updating note:', error);
        alert('Error updating note. Make sure the API is running.');
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}