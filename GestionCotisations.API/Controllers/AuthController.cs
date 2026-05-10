using GestionCotisations.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GestionCotisations.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("setup-admin")]
    public async Task<IActionResult> SetupAdmin()
    {
        if (!await _context.Roles.AnyAsync())
        {
            _context.Roles.AddRange(
                new Models.Role { Libelle = "Administrateur", Description = "Accès complet" },
                new Models.Role { Libelle = "Tresorier", Description = "Gestion financière" },
                new Models.Role { Libelle = "Membre", Description = "Lecture seule" }
            );
            await _context.SaveChangesAsync();
        }

        var roleAdmin = await _context.Roles.FirstAsync(r => r.Libelle == "Administrateur");
        var existing = await _context.Utilisateurs.FirstOrDefaultAsync(u => u.Email == "admin@association.sn");

        if (existing != null)
        {
            existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
            existing.Actif = true;
        }
        else
        {
            _context.Utilisateurs.Add(new Models.Utilisateur
            {
                Nom = "Admin",
                Prenom = "Super",
                Email = "admin@association.sn",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                RoleId = roleAdmin.Id,
                Actif = true,
                DateCreation = DateTime.Now
            });
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Admin créé/réinitialisé", email = "admin@association.sn", password = "Admin123!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var utilisateur = await _context.Utilisateurs
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.Actif);

        if (utilisateur == null || !BCrypt.Net.BCrypt.Verify(request.Password, utilisateur.PasswordHash))
            return Unauthorized(new { message = "Email ou mot de passe incorrect" });

        utilisateur.DerniereConnexion = DateTime.Now;
        await _context.SaveChangesAsync();

        var token = GenererToken(utilisateur);

        return Ok(new
        {
            token,
            utilisateur = new
            {
                utilisateur.Id,
                utilisateur.Nom,
                utilisateur.Prenom,
                utilisateur.Email,
                Role = utilisateur.Role.Libelle
            }
        });
    }

    private string GenererToken(Models.Utilisateur utilisateur)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, utilisateur.Id.ToString()),
            new Claim(ClaimTypes.Email, utilisateur.Email),
            new Claim(ClaimTypes.Role, utilisateur.Role.Libelle),
            new Claim(ClaimTypes.Name, $"{utilisateur.Nom} {utilisateur.Prenom}")
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public record LoginRequest(string Email, string Password);