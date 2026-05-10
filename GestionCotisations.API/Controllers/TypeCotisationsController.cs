using GestionCotisations.API.Data;
using GestionCotisations.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionCotisations.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TypeCotisationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TypeCotisationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var types = await _context.TypeCotisations
            .Where(t => t.Actif)
            .OrderBy(t => t.Libelle)
            .Select(t => new { t.Id, t.Libelle, t.Montant, t.Periodicite, t.Description })
            .ToListAsync();
        return Ok(types);
    }

    [HttpPost]
    [Authorize(Roles = "Administrateur")]
    public async Task<IActionResult> Create([FromBody] TypeCotisation type)
    {
        type.DateCreation = DateTime.Now;
        _context.TypeCotisations.Add(type);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Type créé", type.Id });
    }
}
