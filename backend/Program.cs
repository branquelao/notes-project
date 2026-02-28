using Microsoft.EntityFrameworkCore;
using NotesProjectAPI.Data;
using NotesProjectAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://127.0.0.1:5500", "http://localhost:5500")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Auto-migrate e seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    // Aplica migrations
    db.Database.Migrate();

    // Adiciona dados iniciais se o banco estiver vazio
    if (!db.Notes.Any())
    {
        db.Notes.AddRange(
            new Note
            {
                Title = "Welcome to Notes Project!",
                Content = "This is your first note. Start writing!",
                IsFavorite = true
            },
            new Note
            {
                Title = "Getting Started",
                Content = "You can format text, create lists, and more!"
            }
        );
        db.SaveChanges();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS
app.UseCors("AllowFrontend");

app.UseAuthorization();
app.MapControllers();

app.Run();