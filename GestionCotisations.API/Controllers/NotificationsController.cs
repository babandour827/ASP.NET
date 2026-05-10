using GestionCotisations.API.Data;
using GestionCotisations.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionCotisations.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotificationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var notifications = await _context.Notifications
            .Include(n => n.Membre)
            .OrderByDescending(n => n.DateCreation)
            .Select(n => new
            {
                n.Id,
                n.Type,
                n.Sujet,
                n.Message,
                n.Statut,
                n.Email,
                n.DateEnvoi,
                n.DateCreation,
                Membre = n.Membre.Nom + " " + n.Membre.Prenom
            })
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpPost("generer")]
    [Authorize(Roles = "Administrateur,Tresorier")]
    public async Task<IActionResult> GenererNotifications()
    {
        var cotisationsEnRetard = await _context.Cotisations
            .Include(c => c.Membre)
            .Where(c => c.Statut == "EnRetard" || c.Statut == "EnAttente")
            .ToListAsync();

        int count = 0;
        foreach (var cotisation in cotisationsEnRetard)
        {
            var dejaNotifie = await _context.Notifications.AnyAsync(n =>
                n.MembreId == cotisation.MembreId &&
                n.Type == "Rappel" &&
                n.DateCreation >= DateTime.Now.AddDays(-7));

            if (!dejaNotifie)
            {
                _context.Notifications.Add(new Notification
                {
                    MembreId = cotisation.MembreId,
                    Type = "RappelPaiement",
                    Sujet = $"Rappel de cotisation - Exercice {cotisation.Exercice}",
                    Message = $"Bonjour {cotisation.Membre.Prenom} {cotisation.Membre.Nom}, votre cotisation de {cotisation.MontantDu - cotisation.MontantPaye:N0} FCFA est en attente de règlement.",
                    Email = cotisation.Membre.Email,
                    Statut = "Envoye",
                    DateEnvoi = DateTime.Now,
                    DateCreation = DateTime.Now
                });
                count++;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = $"{count} notification(s) générée(s)" });
    }

    [HttpPut("{id}/marquer-lu")]
    public async Task<IActionResult> MarquerLu(int id)
    {
        var notif = await _context.Notifications.FindAsync(id);
        if (notif == null) return NotFound();
        notif.Statut = "Annule";
        await _context.SaveChangesAsync();
        return Ok(new { message = "Notification archivée" });
    }
}
