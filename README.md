# 📝 Notes Project

A **full-stack note-taking application** inspired by **Notion**, built with **ASP.NET Core Web API** and **vanilla JavaScript**.

---

## ✨ Features

### 📄 Note Management
- **Create notes** with title and rich-text content
- **Auto-save** - Changes saved automatically after 1 second of inactivity
- **Favorite notes** - Pin important notes to the top with star icon (⭐)
- **Duplicate notes** - Clone existing notes with one click
- **Delete notes** with confirmation prompt
- **Export notes** as plain text files
- **Search notes** - Real-time filtering by title and content
- **Sidebar navigation** - All notes listed with smart sorting (favorites first, then by last update)
- Timestamp tracking (Created at / Updated at)

---

### ✍️ Rich Text Editor
- **Formatting toolbar** with essential text styling:
  - **Bold** (Ctrl+B)
  - *Italic* (Ctrl+I)
  - <u>Underline</u> (Ctrl+U)
  - ~~Strikethrough~~
  - Bullet lists
  - Numbered lists
  - Clear formatting
- **ContentEditable** API for native editing experience
- HTML content storage for rich formatting preservation

---

### 🎨 Customization Options
- **Dark mode** - Toggle between light and dark themes with preference persistence
- **Font selection**:
  - Default (System font)
  - Serif (Georgia)
  - Mono (Courier New)
- **Text size toggle** - Small text mode for compact writing
- **Full width mode** - Expanded editor for more writing space
- **Settings menu** - Notion-style dropdown with all customization options

---

### 🎨 User Interface
- **Notion-inspired design** with sidebar + editor layout
- **Split-pane interface**:
  - Left sidebar with notes list and search bar
  - Right editor area with formatting tools
- **Theme support**:
  - Light mode (default) - Minimalist black & white aesthetic
  - Dark mode - Easy on the eyes for night-time writing
- Clean, distraction-free writing environment
- Smooth hover animations and transitions
- Active note highlighting in sidebar
- Inline favorite and delete buttons (visible on hover)
- CSS variables for easy theming

---

### ⌨️ Keyboard Shortcuts
- **Ctrl+N** - Create new note
- **Ctrl+S** - Save note manually
- **Ctrl+B** - Bold text
- **Ctrl+I** - Italic text
- **Ctrl+U** - Underline text
- **Ctrl+D** - Duplicate current note

---

### 🔌 API Integration
- RESTful API communication
- **CRUD operations**:
  - `GET /api/Notes` – List all notes
  - `GET /api/Notes/{id}` – Get specific note
  - `POST /api/Notes` – Create new note
  - `PUT /api/Notes/{id}` – Update note
  - `DELETE /api/Notes/{id}` – Delete note
  - `PATCH /api/Notes/{id}/favorite` – Toggle favorite status
- Async/await pattern for all HTTP requests
- Error handling with user-friendly messages
- CORS configured for local development
- Auto-save with debouncing (1 second delay)

---

## 🧩 Architecture

### Backend (C# .NET)
- **ASP.NET Core Web API** (.NET 6+)
- **SQLite** for lightweight local data persistence
- **Dapper** for efficient SQL query execution
- **Swagger UI** for API documentation and testing
- **Clean architecture**:
  - `Models` – Data entities
  - `Controllers` – RESTful API endpoints
  - `Database` – connection service, initialization script, and seed logic

### Frontend (Vanilla JavaScript)
- **Pure HTML/CSS/JavaScript** (no frameworks)
- Modern **ES6+ syntax** with async/await
- **Fetch API** for HTTP communication
- **ContentEditable API** for rich text editing
- **LocalStorage** for theme preference persistence
- **DOM manipulation** for dynamic UI updates
- **CSS Variables** for dynamic theming
- Separation of concerns:
  - `index.html` – Structure
  - `css/style.css` – Styling with theme support
  - `js/app.js` – Application logic

---

## 🗄️ Database Schema

### Notes Table
| Column | Type | Description |
|--------|------|-------------|
| Id | int (PK) | Auto-increment primary key |
| Title | nvarchar(max) | Note title (plain text) |
| Content | nvarchar(max) | Note content (HTML format) |
| CreatedAt | datetime2 | Creation timestamp (UTC) |
| UpdatedAt | datetime2 | Last update timestamp (UTC) |
| IsFavorite | bit | Favorite status for pinning notes |

---

## 🚀 Getting Started

### Prerequisites
- Visual Studio 2022 (or later)
- .NET 6.0 SDK (or later)
- Visual Studio Code (for frontend development)
- SQLite (handled automatically by the project)

### Running the Backend
1. Open `backend/NotesProjectAPI/NotesProjectAPI.sln` in Visual Studio
2. Run the API with **F5**
3. The SQLite database is automatically initialized and seeded on startup
4. Swagger UI opens automatically at `https://localhost:7269/swagger`

### Running the Frontend
1. Open the `frontend` folder in VS Code
2. Install **Live Server** extension
3. Right-click `index.html` → **Open with Live Server**
4. Frontend opens at `http://127.0.0.1:5500`

---

## 🛠️ Technologies

### Backend
- **C# .NET** – Core application logic
- **ASP.NET Core** – Web API framework
- **SQLite** – Lightweight relational database
- **Dapper** – Micro ORM for SQL execution
- **Swagger/OpenAPI** – API documentation

### Frontend
- **HTML5** – Semantic markup
- **CSS3** – Modern styling with CSS variables and flexbox/grid
- **JavaScript (ES6+)** – Client-side logic
- **Fetch API** – HTTP communication
- **ContentEditable API** – Rich text editing
- **LocalStorage API** – Theme preference persistence

---

## 📌 Project Status

🚧 **In development**

### Completed
- ✅ Backend API with full CRUD operations
- ✅ Database setup with SQLite and SQL queries
- ✅ Notion-inspired UI with sidebar navigation
- ✅ Rich text editor with formatting toolbar
- ✅ Auto-save functionality with debouncing
- ✅ Search functionality with real-time filtering
- ✅ Favorite notes (pin to top)
- ✅ Dark mode with preference persistence
- ✅ Font customization (Default, Serif, Mono)
- ✅ Text size and width toggles
- ✅ Note duplication
- ✅ Export notes as text files
- ✅ Keyboard shortcuts
- ✅ CORS configuration for local development
- ✅ Smart note sorting (favorites first, then by update time)
- ✅ Image uploads

### Planned Features
- 🔲 User authentication and authorization
- 🔲 Note categories/folders
- 🔲 Movable Text Lines
- 🔲 Tags system
- 🔲 Mobile responsive design