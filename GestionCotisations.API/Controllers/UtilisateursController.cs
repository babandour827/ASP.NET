using GestionCotisations.API.Data;
using GestionCotisations.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionCotisations.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrateur")]
public class UtilisateursController : ControllerBase
{
    private readonly AppDbContext _context;

    public UtilisateursController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var utilisateurs = await _context.Utilisateurs
            .Include(u => u.Role)
            .OrderBy(u => u.Nom)
            .Select(u => new
            {
                u.Id,
                u.Nom,
                u.Prenom,
                u.Email,
                u.Actif,
                u.DateCreation,
                u.DerniereConnexion,
                Role = u.Role.Libelle,
                u.RoleId
            })
            .ToListAsync();

        return Ok(utilisateurs);
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _context.Roles
            .Select(r => new { r.Id, r.Libelle })
            .ToListAsync();
        return Ok(roles);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUtilisateurRequest request)
    {
        if (await _context.Utilisateurs.AnyAsync(u => u.Email == request.Email))
            return BadRequest(new { message = "Email déjà utilisé" });

        var utilisateur = new Utilisateur
        {
            Nom = request.Nom,
            Prenom = request.Prenom,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = request.RoleId,
            Actif = true,
            DateCreation = DateTime.Now
        };

        _context.Utilisateurs.Add(utilisateur);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Utilisateur créé", utilisateur.Id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUtilisateurRequest request)
    {
        var utilisateur = await _context.Utilisateurs.FindAsync(id);
        if (utilisateur == null) return NotFound();

        utilisateur.Nom = request.Nom;
        utilisateur.Prenom = request.Prenom;
        utilisateur.Email = request.Email;
        utilisateur.RoleId = request.RoleId;
        utilisateur.Actif = request.Actif;

        if (!string.IsNullOrEmpty(request.Password))
            utilisateur.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        await _context.SaveChangesAsync();
        return Ok(new { message = "Utilisateur mis à jour" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var utilisateur = await _context.Utilisateurs.FindAsync(id);
        if (utilisateur == null) return NotFound();

        utilisateur.Actif = false;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Utilisateur désactivé" });
    }
}

public record CreateUtilisateurRequest(string Nom, string Prenom, string Email, string Password, int RoleId);
public record UpdateUtilisateurRequest(string Nom, string Prenom, string Email, int RoleId, bool Actif, string? Password);
