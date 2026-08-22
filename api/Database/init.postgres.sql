CREATE TABLE IF NOT EXISTS Users (
    Id            SERIAL PRIMARY KEY,
    Email         TEXT NOT NULL UNIQUE,
    PasswordHash  TEXT NOT NULL,
    Name          TEXT NOT NULL,
    CreatedAt     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS Notes (
    Id            SERIAL PRIMARY KEY,
    UserId        INTEGER NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    Title         TEXT NOT NULL DEFAULT '',
    Content       TEXT NOT NULL DEFAULT '',
    CreatedAt     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UpdatedAt     TIMESTAMPTZ NOT NULL DEFAULT now(),
    IsBookmarked  BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_notes_userid ON Notes(UserId);

CREATE TABLE IF NOT EXISTS NoteLinks (
    Id            SERIAL PRIMARY KEY,
    SourceNoteId  INTEGER NOT NULL REFERENCES Notes(Id) ON DELETE CASCADE,
    TargetNoteId  INTEGER NOT NULL REFERENCES Notes(Id) ON DELETE CASCADE,
    UserId        INTEGER NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    UNIQUE (SourceNoteId, TargetNoteId)
);

CREATE INDEX IF NOT EXISTS idx_notelinks_source ON NoteLinks(SourceNoteId);
CREATE INDEX IF NOT EXISTS idx_notelinks_target ON NoteLinks(TargetNoteId);
CREATE INDEX IF NOT EXISTS idx_notelinks_userid ON NoteLinks(UserId);