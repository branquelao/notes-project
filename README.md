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

### Rich Text Editor  
- Block-based editing experience
- Per-block actions menu
- Block types:
  - Text
  - Bulleted List
  - Numbered List
  - To-do List
- Notion-style keyboard behavior:
  - `Enter` creates a new block of the same type
  - `Enter` on an empty list item exits the list
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
- ✅ Dark mod
- ✅ Note duplication
- ✅ Export notes
- ✅ CORS setup
- ✅ Smart sorting
- ✅ User authentication with JWT (login & register UI)
- ✅ Block-based editor architecture
- ✅ Bulleted List blocks
- ✅ Numbered List blocks
- ✅ To-do List blocks
- ✅ Notion-style Enter behavior

---

### Planned Features
- 🔲 Categories/folders
- 🔲 Tags system
- 🔲 Image uploads (server-side)
- 🔲 Persist block types and checklist state
- 🔲 Slash commands (/todo, /image, /heading)