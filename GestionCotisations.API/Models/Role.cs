namespace GestionCotisations.API.Models;

public class Role
{
    public int Id { get; set; }
    public string Libelle { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime DateCreation { get; set; } = DateTime.Now;
    public ICollection<Utilisateur> Utilisateurs { get; set; } = new List<Utilisateur>();
}