using Microsoft.AspNetCore.Mvc;
using Dapper;
using NotesProjectAPI.Database;
using NotesProjectAPI.Models;

namespace NotesProjectAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotesController : ControllerBase
    {
        private readonly DatabaseService _databaseService;

        public NotesController(DatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        // GET: api/Notes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Note>>> GetNotes()
        {
            using var connection = _databaseService.CreateConnection();
            
            var notes = await connection.QueryAsync<Note>(
                "SELECT * FROM Notes ORDER BY CreatedAt DESC");

            return Ok(notes);
        }

        // GET: api/Notes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            using var connection = _databaseService.CreateConnection();

            var note = await connection .QueryFirstOrDefaultAsync<Note>(
                "SELECT * FROM Notes WHERE Id = @Id", new { Id = id });

            if (note == null)
            {
                return NotFound();
            }

            return Ok(note);
        }

        // POST: api/Notes
        [HttpPost]
        public async Task<ActionResult<Note>> CreateNote(Note note)
        {
            using var connection = _databaseService.CreateConnection();

            var now = DateTime.UtcNow;

            var sql = @"
                INSERT INTO Notes
                (Title, Content, CreatedAt, UpdatedAt, IsFavorite)
                VALUES
                (@Title, @Content, @CreatedAt, @UpdatedAt, @IsFavorite);

                SELECT last_insert_rowid()";

            var id = await connection.ExecuteScalarAsync<long>(sql, new
            {
                note.Title,
                note.Content,
                CreatedAt = now,
                UpdatedAt = now,
                note.IsFavorite
            });

            note.Id = (int)id;
            note.CreatedAt = now;
            note.UpdatedAt = now;

            return CreatedAtAction(nameof(GetNote), new { id = note.Id }, note);
        }

        // PUT: api/Notes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(int id, Note note)
        {
            if (id != note.Id)
            {
                return BadRequest();
            }

            using var connection = _databaseService.CreateConnection();

            var sql = @"
                UPDATE Notes
                SET
                    Title = @Title,
                    Content = @Content,
                    UpdatedAt = @UpdatedAt,
                    IsFavorite = @IsFavorite
                WHERE Id = @Id";

            var rowsAffected = await connection.ExecuteAsync(sql, new
            {
                note.Title,
                note.Content,
                UpdatedAt = DateTime.UtcNow,
                note.IsFavorite,
                Id = id
            });

            if(rowsAffected == 0)
            {
                return NotFound();
            }

            return NoContent();
        }

        // DELETE: api/Notes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            using var connection = _databaseService.CreateConnection();

            var rowsAffected = await connection.ExecuteAsync(
                "DELETE FROM Notes WHERE Id = @Id", new { Id = id });

            if (rowsAffected == 0)
            {
                return NotFound();
            }

            return NoContent();
        }

        // PATCH: api/Notes/5/favorite
        [HttpPatch("{id}/favorite")]
        public async Task<IActionResult> ToggleFavorite(int id)
        {
            using var connection = _databaseService.CreateConnection();

            var note = await connection.QueryFirstOrDefaultAsync<Note>(
                "SELECT * FROM Notes WHERE Id = @Id", new { Id = id });

            if (note == null)
            {
                return NotFound();
            }

            note.IsFavorite = !note.IsFavorite;
            note.UpdatedAt = DateTime.UtcNow;

            await connection.ExecuteAsync(@"
                UPDATE Notes
                SET IsFavorite = @IsFavorite,
                    UpdatedAt = @UpdatedAt
                WHERE Id = @Id", note);

            return Ok(note);
        }
    }
}