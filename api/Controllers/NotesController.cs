using Dapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration.UserSecrets;
using NotesProjectAPI.Database;
using NotesProjectAPI.Models;
using System.Security.Claims;

namespace NotesProjectAPI.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ApiController]
    [Route("api/[controller]")]
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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var notes = await connection.QueryAsync<Note>(
                "SELECT * FROM Notes WHERE UserId = @UserId ORDER BY CreatedAt DESC",
                new { UserId = userId }
);
            return Ok(notes);
        }

        // GET: api/Notes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            using var connection = _databaseService.CreateConnection();
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var note = await connection .QueryFirstOrDefaultAsync<Note>(
                "SELECT * FROM Notes WHERE Id = @Id AND UserId = @UserId",
                new { Id = id, UserId = userId });

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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var now = DateTime.UtcNow;

            var sql = @"
                INSERT INTO Notes
                (UserId, Title, Content, CreatedAt, UpdatedAt, IsFavorite)
                VALUES
                (@UserId, @Title, @Content, @CreatedAt, @UpdatedAt, @IsFavorite);

                SELECT last_insert_rowid()";

            var id = await connection.ExecuteScalarAsync<long>(sql, new
            {
                UserId = userId,
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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var sql = @"
                UPDATE Notes
                SET
                    Title = @Title,
                    Content = @Content,
                    UpdatedAt = @UpdatedAt,
                    IsFavorite = @IsFavorite
                WHERE Id = @Id AND UserId = @UserId";

            var rowsAffected = await connection.ExecuteAsync(sql, new
            {
                note.Title,
                note.Content,
                UpdatedAt = DateTime.UtcNow,
                note.IsFavorite,
                Id = id,
                UserId = userId
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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var rowsAffected = await connection.ExecuteAsync(
                "DELETE FROM Notes WHERE Id = @Id AND UserId = @UserId",
                new { Id = id, UserId = userId });

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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var note = await connection.QueryFirstOrDefaultAsync<Note>(
                "SELECT * FROM Notes WHERE Id = @Id AND UserId = @UserId", new { Id = id, UserId = userId });

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
                WHERE Id = @Id AND UserId = @UserId",
                new
                {
                    note.IsFavorite,
                    note.UpdatedAt,
                    note.Id,
                    UserId = userId
                });

            return Ok(note);
        }
    }
}