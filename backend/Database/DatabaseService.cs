using Dapper;
using Microsoft.Data.Sqlite;
using System.Data;
using System.Data.Common;

namespace NotesProjectAPI.Database
{
    public class DatabaseService
    {
        private readonly string _connectionString;

        public DatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string not found");
        }

        public IDbConnection CreateConnection()
        {
            return new SqliteConnection(_connectionString);
        }

        public async Task InitializeDatabaseAsync()
        {
            using var connection = CreateConnection();
            connection.Open();

            // Read and execute init.sqlite.sql
            var scriptPath = Path.Combine(AppContext.BaseDirectory, "Database", "init.sqlite.sql");

            if (!File.Exists(scriptPath))
            {
                throw new FileNotFoundException($"Database initialization script not found at: {scriptPath}");
            }

            var script = await File.ReadAllTextAsync(scriptPath);

            using var command = (DbCommand)connection.CreateCommand();
            command.CommandText = script;
            await command.ExecuteNonQueryAsync();

            //Seed
            var count = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Notes");

            if(count == 0)
            {
                var now = DateTime.UtcNow.ToString("o");

                var seedSql = @"
                    INSERT INTO Notes
                    (Title, Content, CreatedAt, UpdatedAt, IsFavorite)
                    VALUES
                    (@Title1, @Content1, @CreatedAt, @UpdatedAt, @Favorite1),
                    (@Title2, @Content2, @CreatedAt, @UpdatedAt, @Favorite2);";

                await connection.ExecuteAsync(seedSql, new
                {
                    Title1 = "Welcome to Notes Project!",
                    Content1 = "This is your first note. Start writing!",
                    Favorite1 = 1,

                    Title2 = "Getting Started",
                    Content2 = "You can format text, create lists, and more!",
                    Favorite2 = 0,

                    CreatedAt = now,
                    UpdatedAt = now
                });
            }
        }
    }
}