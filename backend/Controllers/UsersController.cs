using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotesProjectAPI.Database;
using NotesProjectAPI.Models;

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

        [HttpGet]
        public async Task<IActionResult> GetUsers(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            using var connection = _databaseService.CreateConnection();

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 50) pageSize = 50;

            var offset = (pageNumber - 1) * pageSize;

            // Total users count
            var totalCount = await connection.ExecuteScalarAsync<int>(
                "SELECT COUNT(*) FROM Users"
            );

            // Paginated query
            var users = await connection.QueryAsync<UserResponse>(
                @"SELECT Id, Email, Name, CreatedAt
                  FROM Users
                  ORDER BY CreatedAt DESC
                  LIMIT @PageSize OFFSET @Offset",
                new { PageSize = pageSize, Offset = offset }
            );

            var result = new
            {
                pageNumber,
                pageSize,
                totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                items = users
            };

            return Ok(result);
        }
    }
}
