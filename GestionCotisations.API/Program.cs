using GestionCotisations.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Base de données
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Seed des données initiales
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.Roles.Any())
    {
        db.Roles.AddRange(
            new GestionCotisations.API.Models.Role { Libelle = "Administrateur", Description = "Accès complet" },
            new GestionCotisations.API.Models.Role { Libelle = "Tresorier", Description = "Gestion financière" },
            new GestionCotisations.API.Models.Role { Libelle = "Membre", Description = "Lecture seule" }
        );
        db.SaveChanges();
    }

    if (!db.Utilisateurs.Any())
    {
        var roleAdmin = db.Roles.First(r => r.Libelle == "Administrateur");
        db.Utilisateurs.Add(new GestionCotisations.API.Models.Utilisateur
        {
            Nom = "Admin",
            Prenom = "Super",
            Email = "admin@association.sn",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            RoleId = roleAdmin.Id,
            Actif = true,
            DateCreation = DateTime.Now
        });
        db.SaveChanges();
    }
}

app.Run();