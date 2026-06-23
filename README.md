# Notes Project

A **full-stack, authenticated note-taking application** inspired by **Notion**, built with **ASP.NET Core Web API** and **vanilla JavaScript**.

> The frontend is served directly by ASP.NET via `wwwroot`. No separate frontend server is required.

---

## Features

### Authentication
- JWT authentication (2-hour token expiry)
- Login & registration UI
- Protected routes
- Persistent sessions via localStorage
- Automatic bearer token handling

### Note Management
- **Create notes** with title and rich-text content
- **Auto-save** - Changes saved automatically after 1 second of inactivity
- **Favorite notes** - Pin important notes to the top with star icon (⭐)
- **Duplicate notes** - Clone existing notes with one click
- **Delete notes**
- **Export notes** as plain text files
- **Search notes** - Real-time filtering by title and content
- **Sidebar navigation** - Notes sorted by favorites first, then last update
- Timestamp tracking (Created at / Updated at)

### Checklist Support (Work in Progress)
- Insert interactive checklist items
- Persistent checkbox state after reload
- Auto-save support for checklist changes
- Create new checklist item with `Enter`
- Remove empty checklist item with `Enter` on an empty item
- Keyboard shortcut:
  - `Ctrl + Shift + C` → Insert checklist item
- Experimental implementation using `contenteditable`

### Rich Text Editor
- Formatting toolbar:
  - **Bold** (Ctrl+B)
  - *Italic* (Ctrl+I)
  - Underline (Ctrl+U)
  - ~~Strikethrough~~
  - Bullet lists
  - Numbered lists
  - Interactive checklists *(WIP)*
  - Insert links (manual selection + auto-linkify on paste)
  - Insert images (file picker or paste from clipboard)
  - Clear formatting
- **ContentEditable API**
- HTML content storage for formatting preservation

### Customization
- Toggle for Dark mode
- Varied Font selection

### User Interface
- Notion-inspired layout
- Split-pane editor
- Light and dark themes
- Inline note actions
- Responsive interactions

### Keyboard Shortcuts
- **Ctrl+N** – New note
- **Ctrl+S** – Save note
- **Ctrl+B** – Bold
- **Ctrl+I** – Italic
- **Ctrl+U** – Underline
- **Ctrl+D** – Duplicate note
- **Ctrl+Shift+C** – Insert checklist item

### API Integration
RESTful API with JWT authentication.

Main features:
- Authentication (register & login)
- Notes CRUD
- Favorites system
- Auto-save support
- Paginated user listing

Swagger available at:
https://localhost:7269/swagger

### Architecture
- ASP.NET Core Web API
- Vanilla JavaScript frontend served via `wwwroot`
- JWT authentication
- SQLite database (via Dapper)
- Single-origin full-stack architecture

---

## Getting Started

### Prerequisites
- Visual Studio 2022+
- .NET 6+

### Running the Application
1. Open `api/NotesProjectAPI.sln`
2. Press **F5**
3. Swagger opens at:  
   `https://localhost:7269/swagger`
4. Website opens at:  
   `https://localhost:7269/`

---

## Technologies

### Backend
- ASP.NET Core Web API
- SQLite
- Dapper
- JWT Authentication

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- ContentEditable API
- LocalStorage API

---

## Project Status

In development

### Completed
- ✅ Full CRUD API
- ✅ SQLite database with Dapper
- ✅ Notion-style UI
- ✅ Rich text editor
- ✅ Auto-save
- ✅ Search
- ✅ Favorites
- ✅ Dark mode
- ✅ Font customization
- ✅ Layout customization
- ✅ Note duplication
- ✅ Export notes
- ✅ Keyboard shortcuts
- ✅ CORS setup
- ✅ Smart sorting
- ✅ User authentication with JWT (login & register UI)
- ✅ Image insertion (file picker and clipboard paste)
- ✅ Link insertion with auto-linkify

---

### Planned Features
- 🔲 Categories/folders
- 🔲 Tags system
- 🔲 Image uploads (server-side)
- 🔲 Mobile responsiveness
- 🔲 Better checklist UX
- 🔲 Drag-and-drop blocks
- 🔲 Slash commands (/todo, /image, /heading)
- 🔲 Block-based editor architecture