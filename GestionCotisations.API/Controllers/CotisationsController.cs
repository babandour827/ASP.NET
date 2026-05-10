using GestionCotisations.API.Data;
using GestionCotisations.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionCotisations.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CotisationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CotisationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? exercice, [FromQuery] string? statut)
    {
        var query = _context.Cotisations
            .Include(c => c.Membre)
            .Include(c => c.TypeCotisation)
            .AsQueryable();

        if (exercice.HasValue)
            query = query.Where(c => c.Exercice == exercice.Value);

        if (!string.IsNullOrEmpty(statut))
            query = query.Where(c => c.Statut == statut);

        var cotisations = await query
            .OrderByDescending(c => c.DateCreation)
            .Select(c => new
            {
                c.Id,
                c.Exercice,
                c.MontantDu,
                c.MontantPaye,
                Solde = c.MontantDu - c.MontantPaye,
                c.DateEcheance,
                c.Statut,
                Membre = c.Membre.Nom + " " + c.Membre.Prenom,
                TypeCotisation = c.TypeCotisation.Libelle
            })
            .ToListAsync();

        return Ok(cotisations);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cotisation = await _context.Cotisations
            .Include(c => c.Membre)
            .Include(c => c.TypeCotisation)
            .Include(c => c.Paiements)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cotisation == null) return NotFound();
        return Ok(cotisation);
    }

    [HttpPost]
    [Authorize(Roles = "Administrateur,Tresorier")]
    public async Task<IActionResult> Create([FromBody] Cotisation cotisation)
    {
        cotisation.DateCreation = DateTime.Now;
        _context.Cotisations.Add(cotisation);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = cotisation.Id }, cotisation);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrateur,Tresorier")]
    public async Task<IActionResult> Update(int id, [FromBody] Cotisation cotisation)
    {
        var existing = await _context.Cotisations.FindAsync(id);
        if (existing == null) return NotFound();

        existing.MontantDu = cotisation.MontantDu;
        existing.DateEcheance = cotisation.DateEcheance;
        existing.Statut = cotisation.Statut;
        existing.Notes = cotisation.Notes;
        existing.DateModification = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var annee = DateTime.Now.Year;
        var stats = new
        {
            TotalMembresActifs = await _context.Membres.CountAsync(m => m.Statut == "Actif"),
            TotalCotisationsAnnee = await _context.Cotisations.CountAsync(c => c.Exercice == annee),
            TotalEncaisse = await _context.Cotisations.Where(c => c.Exercice == annee).SumAsync(c => c.MontantPaye),
            TotalAttendu = await _context.Cotisations.Where(c => c.Exercice == annee).SumAsync(c => c.MontantDu),
            CotisationsEnRetard = await _context.Cotisations.CountAsync(c => c.Statut == "EnRetard"),
            CotisationsEnAttente = await _context.Cotisations.CountAsync(c => c.Statut == "EnAttente")
        };
        return Ok(stats);
    }
}