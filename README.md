# 📝 Notes Project

A **full-stack, authenticated note-taking application** inspired by **Notion**, built with **ASP.NET Core Web API** and **vanilla JavaScript**.

> ⚠️ The frontend is served directly by ASP.NET via `wwwroot`. No separate frontend server is required.

---

## ✨ Features

### 🔐 Authentication
- **User registration and login UI**
- Secure authentication using **JWT (JSON Web Tokens)**
- Token stored in **localStorage**
- Protected routes with automatic redirect if not authenticated
- **Bearer token** automatically attached to all API requests
- Session persistence (user stays logged in after refresh)
- Logout functionality with token cleanup

👉 Users no longer need Swagger or manual token handling to use the application.

---

### 📄 Note Management
- **Create notes** with title and rich-text content
- **Auto-save** - Changes saved automatically after 1 second of inactivity
- **Favorite notes** - Pin important notes to the top with star icon (⭐)
- **Duplicate notes** - Clone existing notes with one click
- **Delete notes**
- **Export notes** as plain text files
- **Search notes** - Real-time filtering by title and content
- **Sidebar navigation** - Notes sorted by favorites first, then last update
- Timestamp tracking (Created at / Updated at)

---

### ✍️ Rich Text Editor
- Formatting toolbar:
  - **Bold** (Ctrl+B)
  - *Italic* (Ctrl+I)
  - <u>Underline</u> (Ctrl+U)
  - ~~Strikethrough~~
  - Bullet lists
  - Numbered lists
  - Clear formatting
- **ContentEditable API**
- HTML content storage for formatting preservation

---

### 🎨 Customization Options
- **Dark mode** with persistence
- **Font selection**:
  - Default (System)
  - Serif (Georgia)
  - Mono (Courier New)
- **Small text mode**
- **Full width mode**
- Notion-style settings dropdown

---

### 🎨 User Interface
- Notion-inspired layout (sidebar + editor)
- Split-pane interface
- Clean, distraction-free writing experience
- Light and dark themes
- Smooth interactions and hover states
- Active note highlighting
- Inline actions (favorite/delete)

---

### ⌨️ Keyboard Shortcuts
- **Ctrl+N** – New note
- **Ctrl+S** – Save note
- **Ctrl+B** – Bold
- **Ctrl+I** – Italic
- **Ctrl+U** – Underline
- **Ctrl+D** – Duplicate note

---

### 🔌 API Integration
- RESTful API with **JWT authentication**
- Authentication endpoints:
  - `POST /api/auth/register` – Register user
  - `POST /api/auth/login` – Login and receive token
- Notes endpoints:
  - `GET /api/Notes`
  - `GET /api/Notes/{id}`
  - `POST /api/Notes`
  - `PUT /api/Notes/{id}`
  - `DELETE /api/Notes/{id}`
  - `PATCH /api/Notes/{id}/favorite`
- All protected routes require:
  - `Authorization: Bearer <token>`
- Token handled automatically by frontend
- Async/await pattern
- Error handling
- Auto-save with debounce

---

## 🔑 Authentication Flow

1. User logs in via `auth.html`
2. Backend returns a JWT token
3. Token is stored in `localStorage`
4. All API requests include `Authorization: Bearer <token>`
5. If token is missing or invalid → redirect to login

---

## 🧩 Architecture

### API + Frontend (ASP.NET Core)

This project uses a **unified architecture**, where:

- ASP.NET Core serves:
  - REST API endpoints
  - Static frontend files via `wwwroot`

- Frontend is a **vanilla JavaScript SPA**
- Authentication handled via **JWT**
- Frontend and backend run on the **same origin**

#### Structure:
- `api/` (formerly `backend/`)
  - `Controllers/`
  - `Database/`
  - `Models/`
  - `wwwroot/` → frontend (HTML, CSS, JS)

Files:
- `auth.html` – Login/Register page
- `index.html` – Main app
- `css/style.css` – Main styles
- `css/auth.css` – Auth styles
- `js/app.js` – App logic
- `js/auth.js` – Auth logic

---

## 🗄️ Database Schema

### Notes Table

| Column     | Type            | Description              |
|------------|-----------------|--------------------------|
| Id         | int (PK)        | Primary key              |
| Title      | nvarchar(max)   | Note title               |
| Content    | nvarchar(max)   | HTML content             |
| CreatedAt  | datetime2       | Created timestamp        |
| UpdatedAt  | datetime2       | Updated timestamp        |
| IsFavorite | bit             | Favorite flag            |

---

## 🚀 Getting Started

### Prerequisites
- Visual Studio 2022+
- .NET 6+
- VS Code
- SQL Server LocalDB

---

### Running the Application
1. Open `api/NotesProjectAPI.sln`
2. Press **F5**
3. Swagger opens at:  
   `https://localhost:7269/swagger`
4. Website opens at:
   `https://localhost:7269/`

---

## 🛠️ Technologies

### Backend
- C#
- ASP.NET Core
- Dapper
- SQL Server
- Swagger

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- ContentEditable API
- LocalStorage API

---

## 📌 Project Status

🚧 In development

### Completed
- ✅ Full CRUD API
- ✅ Database with EF Core
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
- ✅ **User authentication with JWT (login & register UI)**

---

### Planned Features
- 🔲 Categories/folders
- 🔲 Tags system
- 🔲 Image uploads (server-side)
- 🔲 Mobile responsiveness
