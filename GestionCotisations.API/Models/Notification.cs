namespace GestionCotisations.API.Models;

public class Notification
{
    public int Id { get; set; }
    public int MembreId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Sujet { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime? DateEnvoi { get; set; }
    public string Statut { get; set; } = "EnAttente";
    public string Email { get; set; } = string.Empty;
    public int Tentatives { get; set; } = 0;
    public string? ErreurMsg { get; set; }
    public DateTime DateCreation { get; set; } = DateTime.Now;
    public Membre Membre { get; set; } = null!;
}