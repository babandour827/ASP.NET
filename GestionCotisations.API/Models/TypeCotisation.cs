namespace GestionCotisations.API.Models;

public class TypeCotisation
{
    public int Id { get; set; }
    public string Libelle { get; set; } = string.Empty;
    public decimal Montant { get; set; }
    public string Periodicite { get; set; } = "Annuel";
    public string? Description { get; set; }
    public bool Actif { get; set; } = true;
    public DateTime DateCreation { get; set; } = DateTime.Now;
    public DateTime? DateModification { get; set; }
    public ICollection<Cotisation> Cotisations { get; set; } = new List<Cotisation>();
}