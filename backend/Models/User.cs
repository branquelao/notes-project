namespace NotesProjectAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Password { get; set; } // User Entry
        public string PasswordHash { get; set; } // Database
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}