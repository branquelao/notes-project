using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotesProjectAPI.Database;
using NotesProjectAPI.Models;
using System.Security.Claims;

namespace NotesProjectAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly DatabaseService _databaseService;

        public UsersController(DatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        // GET: api/Users/me
        // Returns only the logged-in user's own data.
        // No general listing endpoint — this app has no admin/roles system,
        // so there is no legitimate reason for a user to see other users' data.
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            using var connection = _databaseService.CreateConnection();
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var user = await connection.QueryFirstOrDefaultAsync<UserResponse>(
                "SELECT Id, Email, CreatedAt FROM Users WHERE Id = @UserId",
                new { UserId = userId });

            if (user == null)
                return NotFound();

            return Ok(user);
        }
    }
}