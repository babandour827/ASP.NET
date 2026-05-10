namespace GestionCotisations.API.Models;

public class Utilisateur
{
    public int Id { get; set; }
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public bool Actif { get; set; } = true;
    public DateTime DateCreation { get; set; } = DateTime.Now;
    public DateTime? DerniereConnexion { get; set; }
    public string? TokenReset { get; set; }
    public DateTime? TokenResetExpiry { get; set; }
    public Role Role { get; set; } = null!;
    public ICollection<Paiement> Paiements { get; set; } = new List<Paiement>();
}