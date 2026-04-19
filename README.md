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

### 🔐 Authentication
- **User registration and login** with JWT authentication
- **Protected endpoints** – Notes are only accessible to authenticated users
- **User-based data isolation** – Each user can only access their own notes
- Passwords securely stored using hashing (BCrypt)

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
- **Authentication endpoints**:
  - `POST /api/auth/register` – Create a new user
  - `POST /api/auth/login` – Authenticate user and receive JWT token
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

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| Id | int (PK) | Auto-increment primary key |
| Email | text | User email (unique) |
| PasswordHash | text | Hashed password |
| Name | text | User name |
| CreatedAt | text | Creation timestamp (UTC) |

### Notes Table
| Column | Type | Description |
|--------|------|-------------|
| Id | int (PK) | Auto-increment primary key |
| Title | text | Note title |
| Content | text | Note content (HTML format) |
| CreatedAt | text | Creation timestamp (UTC) |
| UpdatedAt | text | Last update timestamp (UTC) |
| IsFavorite | integer | Favorite status (0 or 1) |
| UserId | int (FK → Users.Id) | Owner of the note |

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
3. The SQLite database is automatically initialized on startup
4. Swagger UI opens automatically at `https://localhost:7269/swagger`

---

### 🔑 Testing Authentication (Swagger)

1. Open Swagger UI: https://localhost:7269/swagger

2. Register a new user:
   - `POST /api/auth/register`

3. Login:
   - `POST /api/auth/login`
   - Copy the returned **JWT token**

4. Authorize:
   - Click the 🔒 **Authorize** button
   - Enter: `Bearer YOUR_TOKEN_HERE`

5. Access protected endpoints (e.g. `GET /api/Notes`)

---

### Running the Frontend

1. Open the `frontend` folder in VS Code  
2. Install **Live Server**  
3. Right-click `index.html` → **Open with Live Server**  
4. Open: `http://127.0.0.1:5500`

---

### 🌐 Using the Frontend with JWT (DevTools)

This flow assumes you have already authenticated via Swagger and obtained a JWT token.

⚠️ The frontend does not yet implement authentication UI.

#### Steps:

1. (First time only) Register:
   - `POST /api/auth/register`

2. Login:
   - `POST /api/auth/login`
   - Copy the JWT token

3. Open the frontend:
   `http://127.0.0.1:5500`

4. Open DevTools (**F12**) → Console

5. Run:
`localStorage.setItem("token", "YOUR_JWT_TOKEN_HERE");`

6. Reload the page

⚠️ Important:  
Run this command in the frontend (port 5500).  
Running it in Swagger will not work due to different `localStorage` contexts.

---

## 🛠️ Technologies

### Backend
- **C# .NET**
- **ASP.NET Core**
- **SQLite**
- **Dapper**
- **Swagger/OpenAPI**

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- **Fetch API**
- **ContentEditable API**
- **LocalStorage API**

---

## 📌 Project Status

🚧 **In development**

### Completed
- ✅ Full CRUD API
- ✅ SQLite database integration
- ✅ JWT authentication
- ✅ Protected endpoints
- ✅ User-based notes
- ✅ Rich text editor
- ✅ Auto-save
- ✅ Favorites system
- ✅ Search
- ✅ Dark mode
- ✅ UI customization
- ✅ Image upload support

### Planned Features
- 🔲 Frontend authentication UI
- 🔲 Categories / folders
- 🔲 Tags system
- 🔲 Mobile responsiveness

---

## ⚠️ Known Limitations
- No frontend login UI yet
- JWT must be manually injected via DevTools
- No refresh token (fixed expiration)
