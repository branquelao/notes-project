window.addEventListener('beforeunload', () => {
    console.log('PAGE IS RELOADING');
});

// Get Token Function
function getToken() {
    return localStorage.getItem("token");
}

// Logout function
function logout() {
    // Remove authentication token
    localStorage.removeItem("token");

    // Optional: clear any app state (defensive)
    notes = [];
    currentNoteId = null;

    sidebarNotesList.innerHTML = '';
    noteTitle.value = '';
    noteContent.innerHTML = '';

    // Redirect to auth page
    window.location.href = 'auth.html';
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
            // Token expired or invalid → clear and redirect
            localStorage.removeItem("token");
            window.location.href = 'auth.html';
            return Promise.reject('Unauthorized');
        }
        return response;
    });
}

// Redirect to login if no token is found
function enforceAuth() {
    const token = getToken();

    if (!token) {
        // No token -> user is not authenticated
        window.location.href = 'auth.html';
    }
}

// API Base URL
const API_URL = '/api/Notes';

// Elements
const sidebarNotesList = document.getElementById('sidebarNotesList');
const editorPlaceholder = document.getElementById('editorPlaceholder');
const editorContent = document.getElementById('editorContent');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const newNoteBtn = document.getElementById('newNoteBtn');
const searchInput = document.getElementById('searchInput');

// Settings menu
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
const darkModeToggle = document.getElementById('darkModeToggle');
const logoutOption = document.getElementById('logoutOption');

// Actions menu
const actionsBtn = document.getElementById('actionsBtn');
const actionsMenu = document.getElementById('actionsMenu');
const deleteNoteOption = document.getElementById('deleteNoteOption');
const duplicateNoteOption = document.getElementById('duplicateNoteOption');
const exportNoteOption = document.getElementById('exportNoteOption');

// Block menu (per-line)
const blockMenu = document.getElementById('blockMenu');
let activeBlockMenuTarget = null;
const blockBulletedList =
    document.getElementById('blockBulletedList');
const blockNumberedList =
    document.getElementById('blockNumberedList');
const blockChecklist =
    document.getElementById('blockChecklist');

// Font Options
const fontOptions = document.querySelectorAll('.font-option');

//Favorite Button
const favoriteBtn = document.getElementById('favoriteBtn');

// State
let notes = [];
let currentNoteId = null;
let saveTimeout = null;
let currentFont = 'default';
let searchQuery = '';

// Load notes when page loads
document.addEventListener('DOMContentLoaded', () => {
    enforceAuth();
    loadDarkModePreference();
    loadNotes();
});

// New note button
newNoteBtn.addEventListener('click', createNewNote);

// Auto-save on input (debounced)
noteTitle.addEventListener('input', () => autoSave());

noteTitle.addEventListener('keydown', (e) => {

    const atEnd =
        noteTitle.selectionStart ===
        noteTitle.value.length;

    if (
        e.key === 'Enter' ||
        e.key === 'ArrowDown' ||
        (e.key === 'ArrowRight' && atEnd)
    ) {
        e.preventDefault();

        const firstBlock =
            noteContent.querySelector('.block-content');

        if (firstBlock) {
            moveCursorToStart(firstBlock);
        }
    }
});

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
    
    // Auto-linkify URLs (existent code)
    setTimeout(() => {
        autoLinkify();
    }, 100);
});

// Settings button toggle
settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle('active');
    settingsBtn.classList.toggle('active');
    actionsMenu.classList.remove('active');
});

// Close all menus when clicking outside
document.addEventListener('click', (e) => {
    if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
        settingsMenu.classList.remove('active');
        settingsBtn.classList.remove('active');
    }
    if (!actionsMenu.contains(e.target) && e.target !== actionsBtn) {
        actionsMenu.classList.remove('active');
    }
    if (!blockMenu.contains(e.target) && !e.target.classList.contains('block-handle')) {
        closeBlockMenu();
    }
});

// Actions button toggle
actionsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    actionsMenu.classList.toggle('active');
    settingsMenu.classList.remove('active');
});

// Dark mode toggle
darkModeToggle.addEventListener('change', () => {
    toggleDarkMode();
});

// Favorite button toggle
favoriteBtn.addEventListener('click', async () => {
    if (currentNoteId === null) return;

    await toggleFavorite(currentNoteId);
});

// Delete note option
deleteNoteOption.addEventListener('click', () => {
    if (currentNoteId) {
        actionsMenu.classList.remove('active');
        deleteNote(currentNoteId, { stopPropagation: () => {} });
    }
});

// Duplicate note option
duplicateNoteOption.addEventListener('click', () => {
    if (currentNoteId) {
        actionsMenu.classList.remove('active');
        duplicateNote();
    }
});

// Export note option
exportNoteOption.addEventListener('click', () => {
    if (currentNoteId) {
        actionsMenu.classList.remove('active');
        exportNote();
    }
});

// Logout option
logoutOption.addEventListener('click', () => {
    settingsMenu.classList.remove('active');
    logout();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    const keys = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Enter',
        'Backspace'
    ];

    if (keys.includes(e.key)) {
        document.body.classList.add('keyboard-navigation');
    }

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

document.addEventListener('mousemove', () => {
    document.body.classList.remove('keyboard-navigation');
});

// Execute formatting command
function executeCommand(command) {
    document.execCommand(command, false, null);
    noteContent.focus();
}

// Create clickable link
function createLink() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (!selectedText) {
        alert('Please select some text first to turn into a link.');
        return;
    }
    
    // Prompt for URL
    const url = prompt('Enter URL:', 'https://');
    
    if (url && url !== 'https://') {
        // Ensure URL has protocol
        const fullUrl = url.startsWith('http://') || url.startsWith('https://') 
            ? url 
            : 'https://' + url;
        
        // Create link
        document.execCommand('createLink', false, fullUrl);
        
        // Make links open in new tab
        const links = noteContent.querySelectorAll('a[href="' + fullUrl + '"]');
        links.forEach(link => {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        });
    }
    
    noteContent.focus();
}

// Auto-linkify URLs in text
function autoLinkify() {
    const content = noteContent.innerHTML;
    
    // Regex to match URLs
    const urlRegex = /(https?:\/\/[^\s<>"]+)/g;
    
    // Replace URLs with anchor tags (but avoid double-linking)
    const linkedContent = content.replace(urlRegex, (url) => {
        // Check if URL is already inside an <a> tag
        if (content.indexOf(`<a href="${url}"`) !== -1 || 
            content.indexOf(`<a href='${url}'`) !== -1) {
            return url; // Already linked
        }
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
    
    if (linkedContent !== content) {
        // Save cursor position
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const cursorPos = range.startOffset;
        
        // Update content
        noteContent.innerHTML = linkedContent;
        
        // Restore cursor position (approximately)
        try {
            const newRange = document.createRange();
            const textNode = noteContent.childNodes[0];
            if (textNode) {
                newRange.setStart(textNode, Math.min(cursorPos, textNode.length));
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        } catch (e) {
            // Cursor restoration failed, just focus
            noteContent.focus();
        }
    }
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
    const allFonts = ['font-default','font-serif','font-mono','font-playfair','font-lato','font-opensans','font-merriweather','font-roboto','font-nunito','font-sourcecodepro'];
    noteTitle.classList.remove(...allFonts);
    noteContent.classList.remove(...allFonts);
    noteTitle.classList.add(`font-${font}`);
    noteContent.classList.add(`font-${font}`);

    // Persist local note and save
    if (currentNoteId !== null) {
        const index = notes.findIndex(n => n.id === currentNoteId);
        if (index !== -1) {
            notes[index].font = font;
        }
        autoSave();  // Shoots save with debounce
    }
}

// Apply text size
function applyTextSize() {
    if (isSmallText) {
        noteContent.classList.add('small-text');
    } else {
        noteContent.classList.remove('small-text');
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
                <button class="note-item-favorite ${note.isFavorite ? 'active' : ''}">
                    ${note.isFavorite ? '⭐' : ''}
                </button>
                <button class="note-item-delete" onclick="deleteNote(${note.id}, event)">×</button>
            </div>
        `;
        
        noteItem.addEventListener('click', () => selectNote(note.id));
        
        sidebarNotesList.appendChild(noteItem);
    });
}

// BLOCK-BASED EDITOR
let draggedBlock = null;

function createBlock(content = '', type = 'text') {
    const block = document.createElement('div');
    block.className = 'block';
    block.dataset.type = type;
    let prefix = '';

    if (type === 'bullet') {
        prefix = '<span class="block-prefix">●</span>';
    }

    if (type === 'numbered') {
        prefix = '<span class="block-prefix number-prefix">1.</span>';
    }

    if (type === 'todo') {
        prefix = '<input type="checkbox" class="todo-checkbox">';
    }

    block.innerHTML = `
        <span class="block-handle" title="Drag to move">⠿</span>
        ${prefix}
        <div class="block-content" contenteditable="true">${content}</div>
    `;
    initBlockEvents(block);
    return block;
}

function updateNumberedBlocks() {
    const blocks =
        noteContent.querySelectorAll('.block');

    let currentNumber = 1;

    blocks.forEach(block => {
        if (block.dataset.type === 'numbered') {
            const prefix =
                block.querySelector('.number-prefix');

            if (prefix) {
                prefix.textContent =
                    `${currentNumber}.`;
            }

            currentNumber++;
        } else {
            currentNumber = 1;
        }
    });
}

function moveCursorToStart(element) {
    element.focus();

    const range = document.createRange();
    const sel = window.getSelection();

    range.selectNodeContents(element);
    range.collapse(true);

    sel.removeAllRanges();
    sel.addRange(range);
}

function moveCursorToEnd(element) {
    element.focus();

    const range = document.createRange();
    const sel = window.getSelection();

    range.selectNodeContents(element);
    range.collapse(false);

    sel.removeAllRanges();
    sel.addRange(range);
}

function isCursorAtStart(element) {
    const sel = window.getSelection();

    if (!sel.rangeCount) return false;

    const range = sel.getRangeAt(0);

    return (
        range.collapsed &&
        range.startContainer.textContent !== null &&
        range.startOffset === 0
    );
}

function isCursorAtEnd(element) {
    const sel = window.getSelection();

    if (!sel.rangeCount) return false;

    const range = sel.getRangeAt(0);

    const text =
        range.startContainer.textContent || '';

    return (
        range.collapsed &&
        range.startOffset === text.length
    );
}

function initBlockEvents(block) {
    const handle = block.querySelector('.block-handle');
    const content = block.querySelector('.block-content');
    const checkbox = block.querySelector('.todo-checkbox');

    // Saves when a checklist is marked/unmarked
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
                saveTimeout = null;
            }
            saveCurrentNote();
        });
    }

    // Only activates draggable when holding the handle
    handle.addEventListener('mousedown', () => {
        block.setAttribute('draggable', 'true');
    });

    // Opens/closes the per-block menu
    handle.addEventListener('click', (e) => {
        e.stopPropagation();

        if (blockMenu.classList.contains('active') && activeBlockMenuTarget === block) {
            closeBlockMenu();
        } else {
            openBlockMenu(handle, block);
        }
    });

    block.addEventListener('dragstart', (e) => {
        draggedBlock = block;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => block.classList.add('dragging'), 0);
    });

    block.addEventListener('dragend', () => {
        draggedBlock = null;
        block.classList.remove('dragging');
        block.setAttribute('draggable', 'false');
        document.querySelectorAll('.block.drag-over')
            .forEach(b => b.classList.remove('drag-over'));
        autoSave();
    });

    block.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (block !== draggedBlock) {
            block.classList.add('drag-over');
        }
    });

    block.addEventListener('dragleave', () => {
        block.classList.remove('drag-over');
    });

    block.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedBlock && draggedBlock !== block) {
            noteContent.insertBefore(draggedBlock, block);
        }
        block.classList.remove('drag-over');
    });

    // Enter creates a new block
    content.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const isEmpty =
                content.innerText.trim() === '';

            const blockType =
                block.dataset.type || 'text';

            if ( isEmpty && blockType !== 'text') {
                const newBlock =
                    createBlock('', 'text');

                block.replaceWith(newBlock);

                newBlock
                    .querySelector('.block-content')
                    .focus();

                updateNumberedBlocks();
                autoSave();

                return;
            }

            const newBlock =
                createBlock('', blockType);

            block.insertAdjacentElement(
                'afterend',
                newBlock
            );

            const newContent =
                newBlock.querySelector('.block-content');

            newContent.focus();

            updateNumberedBlocks();
            autoSave();
        }

        const blockType =
            block.dataset.type || 'text';

        if (
            e.key === 'Backspace' &&
            content.innerText.trim() === '' &&
            blockType !== 'text'
        ) {
            e.preventDefault();

            const text =
                content.innerHTML;

            const newBlock =
                createBlock(text, 'text');

            block.replaceWith(newBlock);

            newBlock
                .querySelector('.block-content')
                .focus();

            updateNumberedBlocks();
            autoSave();

            return;
        }
        
        // Backspace at the start of an empty block removes it
        if (e.key === 'Backspace' && content.innerText.trim() === '') {

            const isFirstBlock = !block.previousElementSibling;

            if (isFirstBlock) {
                e.preventDefault();

                noteTitle.focus();

                const length = noteTitle.value.length;
                noteTitle.setSelectionRange(length, length);

                return;
            }

            e.preventDefault();

            const prev = block.previousElementSibling;
            block.remove();
            updateNumberedBlocks();

            if (prev) {
                const prevContent = prev.querySelector('.block-content');

                if (prevContent) {
                    prevContent.focus();

                    const range = document.createRange();
                    const sel = window.getSelection();

                    range.selectNodeContents(prevContent);
                    range.collapse(false);

                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }

            autoSave();
        }

        if (
            (e.key === 'ArrowUp' || e.key === 'ArrowLeft') &&
            isCursorAtStart(content)
        ) {
            e.preventDefault();

            const prev = block.previousElementSibling;

            if (!prev) {
                noteTitle.focus();
                return;
            }

            const prevContent =
                prev.querySelector('.block-content');

            if (prevContent) {
                moveCursorToEnd(prevContent);
            }
        }

        if (
            (e.key === 'ArrowDown' || e.key === 'ArrowRight') &&
            isCursorAtEnd(content)
        ) {
            const next = block.nextElementSibling;

            if (next) {
                e.preventDefault();

                const nextContent =
                    next.querySelector('.block-content');

                if (nextContent) {
                    moveCursorToStart(nextContent);
                }
            }
        }
    });

    // Auto-saves when typing
    content.addEventListener('input', () => autoSave());
}

function convertBlockType(type) {
    if (!activeBlockMenuTarget) return;

    const content =
        activeBlockMenuTarget.querySelector('.block-content').innerHTML;

    const newBlock =
        createBlock(content, type);

    activeBlockMenuTarget.replaceWith(newBlock);

    activeBlockMenuTarget = newBlock;

    updateNumberedBlocks();
    autoSave();

    closeBlockMenu();
}

function openBlockMenu(handle, block) {
    activeBlockMenuTarget = block;

    const rect = handle.getBoundingClientRect();
    blockMenu.style.top = `${rect.top - 43}px`;
    blockMenu.style.left = `${rect.left - 220}px`;

    blockMenu.classList.add('active');
}

function closeBlockMenu() {
    blockMenu.classList.remove('active');
    activeBlockMenuTarget = null;
}

blockBulletedList.addEventListener('click', () => {
    convertBlockType('bullet');
});

blockNumberedList.addEventListener('click', () => {
    convertBlockType('numbered');
});

blockChecklist.addEventListener('click', () => {
    convertBlockType('todo');
});

// Converts saved HTML (free text) in blocks
function parseContentToBlocks(html) {
    noteContent.innerHTML = '';

    if (!html || html.trim() === '') {
        noteContent.appendChild(createBlock(''));
        return;
    }

    // Creates temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Already is block format (.block-saved), loads instantly
    const savedBlocks = temp.querySelectorAll('.block-saved');
    if (savedBlocks.length > 0) {
        savedBlocks.forEach(saved => {
            const type = saved.dataset.type || 'text';
            const block = createBlock(saved.innerHTML, type);

            if (type === 'todo' && saved.dataset.checked === 'true') {
                const checkbox = block.querySelector('.todo-checkbox');
                if (checkbox) checkbox.checked = true;
            }

            noteContent.appendChild(block);
        });
        updateNumberedBlocks();
        return;
    }

    // If not, converts old HTML: each son turns into a block
    const children = [...temp.childNodes];
    if (children.length === 0) {
        noteContent.appendChild(createBlock(''));
        return;
    }

    children.forEach(node => {
        const temp2 = document.createElement('div');
        temp2.appendChild(node.cloneNode(true));
        const inner = temp2.innerHTML.trim();
        if (inner && inner !== '<br>') {
            noteContent.appendChild(createBlock(inner));
        }
    });

    if (noteContent.querySelectorAll('.block').length === 0) {
        noteContent.appendChild(createBlock(''));
    }
}

// Serializes blocks back to HTML to save
function serializeBlocks() {
    const blocks = noteContent.querySelectorAll('.block');
    return [...blocks].map(block => {
        const type = block.dataset.type || 'text';
        const content = block.querySelector('.block-content').innerHTML;
        const checkbox = block.querySelector('.todo-checkbox');
        const checked = checkbox ? checkbox.checked : false;

        return `<div class="block-saved" data-type="${type}" data-checked="${checked}">${content}</div>`;
    }).join('');
}

// Select and display a note
async function selectNote(id) {
    // Save current note before switching
    if (currentNoteId !== null && currentNoteId !== id) {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
            saveTimeout = null;
        }
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
    parseContentToBlocks(note.content);
    
    //Set the default font that is saved
    setFont(note.font || 'default');

    // Update sidebar active state
    renderSidebar();

    // Update button if active
    updateFavoriteButton();

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
        content: '',
        font: 'default'
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
        content: serializeBlocks(), // Save as HTML
        isFavorite: note.isFavorite,
        font: currentFont
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
            // Update local notes arrays
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

//Update the favorite top button
function updateFavoriteButton() {
    if (currentNoteId === null) {
        favoriteBtn.textContent = '☆';
        return;
    }

    const note = notes.find(n => n.id === currentNoteId);

    if (!note) {
        favoriteBtn.textContent = '☆';
        return;
    }

    favoriteBtn.textContent = note.isFavorite ? '⭐' : '☆';
}

// Toggle favorite status
async function toggleFavorite(id, event = null) {
    if(event){
        event.stopPropagation(); // Prevent note selection    
    }
    
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
                updateFavoriteButton();
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
    // Handle link clicks (existent code)
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
            autoSave();
        }
    }
});

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