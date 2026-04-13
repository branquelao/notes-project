-- Create Notes table
CREATE TABLE IF NOT EXISTS Notes (
	Id INTEGER PRIMARY KEY AUTOINCREMENT,
	Title TEXT NOT NULL,
	Content TEXT NOT NULL,
	CreatedAt TEXT NOT NULL,
	UpdatedAt TEXT NOT NULL,
	IsFavorite INTEGER NOT NULL DEFAULT 0
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS IX_Notes_IsFavorite ON Notes (IsFavorite);
CREATE INDEX IF NOT EXISTS IX_Notes_UpdatedAt ON Notes (UpdatedAt);