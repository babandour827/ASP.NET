namespace GestionCotisations.API.Models;

public class Membre
{
    public int Id { get; set; }
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telephone { get; set; }
    public string? Adresse { get; set; }
    public string? Ville { get; set; }
    public string? CodePostal { get; set; }
    public DateOnly? DateNaissance { get; set; }
    public DateOnly DateAdhesion { get; set; } = DateOnly.FromDateTime(DateTime.Now);
    public string Statut { get; set; } = "Actif";
    public int? UtilisateurId { get; set; }
    public string? Photo { get; set; }
    public string? Notes { get; set; }
    public DateTime DateCreation { get; set; } = DateTime.Now;
    public DateTime? DateModification { get; set; }
    public Utilisateur? Utilisateur { get; set; }
    public ICollection<Cotisation> Cotisations { get; set; } = new List<Cotisation>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}