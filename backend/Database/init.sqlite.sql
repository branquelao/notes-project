-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Email TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    Name TEXT NOT NULL,
    CreatedAt TEXT NOT NULL
);

-- Create Notes table
CREATE TABLE IF NOT EXISTS Notes (
	Id INTEGER PRIMARY KEY AUTOINCREMENT,
	UserId INTEGER NOT NULL,
	Title TEXT NOT NULL,
	Content TEXT NOT NULL,
	CreatedAt TEXT NOT NULL,
	UpdatedAt TEXT NOT NULL,
	IsFavorite INTEGER NOT NULL DEFAULT 0,
	FOREIGN KEY (UserId) REFERENCES Users(Id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS IX_Notes_IsFavorite ON Notes (IsFavorite);
CREATE INDEX IF NOT EXISTS IX_Notes_UpdatedAt ON Notes (UpdatedAt);