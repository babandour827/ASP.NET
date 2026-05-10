using GestionCotisations.API.Data;
using GestionCotisations.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GestionCotisations.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaiementsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PaiementsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var paiements = await _context.Paiements
            .Include(p => p.Cotisation)
                .ThenInclude(c => c.Membre)
            .OrderByDescending(p => p.DatePaiement)
            .Select(p => new
            {
                p.Id,
                p.Montant,
                p.DatePaiement,
                p.ModePaiement,
                p.Reference,
                Membre = p.Cotisation.Membre.Nom + " " + p.Cotisation.Membre.Prenom
            })
            .ToListAsync();

        return Ok(paiements);
    }

    [HttpPost]
    [Authorize(Roles = "Administrateur,Tresorier")]
    public async Task<IActionResult> Create([FromBody] Paiement paiement)
    {
        var cotisation = await _context.Cotisations.FindAsync(paiement.CotisationId);
        if (cotisation == null) return NotFound(new { message = "Cotisation introuvable" });

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        paiement.EnregistrePar = int.Parse(userId!);
        paiement.DateCreation = DateTime.Now;
        paiement.DatePaiement = DateTime.Now;

        // Le trigger SQL trg_UpdateCotisationStatut gère automatiquement
        // la mise à jour de MontantPaye et Statut sur la cotisation
        _context.Paiements.Add(paiement);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Paiement enregistré", paiement });
    }

    [HttpGet("cotisation/{cotisationId}")]
    public async Task<IActionResult> GetByCotisation(int cotisationId)
    {
        var paiements = await _context.Paiements
            .Where(p => p.CotisationId == cotisationId)
            .OrderByDescending(p => p.DatePaiement)
            .ToListAsync();

        return Ok(paiements);
    }
}