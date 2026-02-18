# 📝 Notes Project

A **full-stack note-taking application** inspired by **Notion**, built with **ASP.NET Core Web API** and **vanilla JavaScript**.

---

## ✨ Features

### 📄 Note Management
- **Create notes** with title and content
- **Edit existing notes** with inline dialogs
- **Delete notes** with confirmation prompt
- **Real-time display** of all saved notes
- Timestamp tracking:
  - **Created at**
  - **Updated at**

---

### 🎨 User Interface
- **Minimalist design** with black & white aesthetic
- Clean, distraction-free writing environment
- Responsive layout with 800px max-width container
- Smooth hover animations on note cards
- Form validation for required fields

---

### 🔌 API Integration
- RESTful API communication
- **CRUD operations**:
  - `GET /api/Notes` – List all notes
  - `GET /api/Notes/{id}` – Get specific note
  - `POST /api/Notes` – Create new note
  - `PUT /api/Notes/{id}` – Update note
  - `DELETE /api/Notes/{id}` – Delete note
- Async/await pattern for all HTTP requests
- Error handling with user-friendly messages
- CORS configured for local development

---

## 🧩 Architecture

### Backend (C# .NET)
- **ASP.NET Core Web API** (.NET 6+)
- **Entity Framework Core** with Code-First approach
- **SQL Server LocalDB** for data persistence
- **Swagger UI** for API documentation and testing
- **MVVM-inspired structure**:
  - `Models` – Data entities
  - `Controllers` – API endpoints
  - `Data` – Database context

### Frontend (Vanilla JavaScript)
- **Pure HTML/CSS/JavaScript** (no frameworks)
- Modern **ES6+ syntax** with async/await
- **Fetch API** for HTTP communication
- DOM manipulation for dynamic UI updates
- Separation of concerns:
  - `index.html` – Structure
  - `css/style.css` – Styling
  - `js/app.js` – Logic

---

## 🗄️ Database Schema

### Notes Table
| Column | Type | Description |
|--------|------|-------------|
| Id | int (PK) | Auto-increment primary key |
| Title | nvarchar(max) | Note title |
| Content | nvarchar(max) | Note content |
| CreatedAt | datetime2 | Creation timestamp (UTC) |
| UpdatedAt | datetime2 | Last update timestamp (UTC) |

---

## 🚀 Getting Started

### Prerequisites
- Visual Studio 2022 (or later)
- .NET 6.0 SDK (or later)
- Visual Studio Code (for frontend development)
- SQL Server LocalDB (included with Visual Studio)

### Running the Backend
1. Open `backend/NotesProjectAPI/NotesProjectAPI.sln` in Visual Studio
2. Press **F5** to run the API
3. Swagger UI opens automatically at `https://localhost:7269/swagger`

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
- **Entity Framework Core** – ORM for database access
- **SQL Server** – Relational database
- **Swagger/OpenAPI** – API documentation

### Frontend
- **HTML5** – Semantic markup
- **CSS3** – Modern styling with flexbox/grid
- **JavaScript (ES6+)** – Client-side logic
- **Fetch API** – HTTP communication

---

## 📌 Project Status

🚧 **In development**

### Completed
- ✅ Backend API with full CRUD operations
- ✅ Database setup with Entity Framework migrations
- ✅ Frontend UI with minimalist design
- ✅ Real-time note display and management
- ✅ CORS configuration for local development

### Planned Features
- 🔲 User authentication and authorization
- 🔲 Rich text editor for note content
- 🔲 Note categories/tags
- 🔲 Search functionality
- 🔲 Dark mode toggle
- 🔲 Markdown support
