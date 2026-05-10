using GestionCotisations.API.Data;
using GestionCotisations.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionCotisations.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MembresController : ControllerBase
{
    private readonly AppDbContext _context;

    public MembresController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var membres = await _context.Membres
            .OrderBy(m => m.Nom)
            .Select(m => new
            {
                m.Id, m.Nom, m.Prenom, m.Email,
                m.Telephone, m.Ville, m.Statut,
                m.DateAdhesion
            })
            .ToListAsync();
        return Ok(membres);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var membre = await _context.Membres
            .Include(m => m.Cotisations)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (membre == null) return NotFound();
        return Ok(membre);
    }

    [HttpPost]
    [Authorize(Roles = "Administrateur,Tresorier")]
    public async Task<IActionResult> Create([FromBody] Membre membre)
    {
        if (await _context.Membres.AnyAsync(m => m.Email == membre.Email))
            return BadRequest(new { message = "Email déjà utilisé" });

        membre.DateCreation = DateTime.Now;
        _context.Membres.Add(membre);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = membre.Id }, membre);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrateur,Tresorier")]
    public async Task<IActionResult> Update(int id, [FromBody] Membre membre)
    {
        var existing = await _context.Membres.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Nom = membre.Nom;
        existing.Prenom = membre.Prenom;
        existing.Email = membre.Email;
        existing.Telephone = membre.Telephone;
        existing.Adresse = membre.Adresse;
        existing.Ville = membre.Ville;
        existing.Statut = membre.Statut;
        existing.DateModification = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrateur")]
    public async Task<IActionResult> Delete(int id)
    {
        var membre = await _context.Membres.FindAsync(id);
        if (membre == null) return NotFound();

        membre.Statut = "Inactif";
        membre.DateModification = DateTime.Now;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Membre désactivé" });
    }
}