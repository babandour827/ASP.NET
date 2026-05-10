namespace GestionCotisations.API.Models;

public class Cotisation
{
    public int Id { get; set; }
    public int MembreId { get; set; }
    public int TypeCotisationId { get; set; }
    public decimal MontantDu { get; set; }
    public decimal MontantPaye { get; set; } = 0;
    public DateOnly DateEcheance { get; set; }
    public DateOnly DateDebut { get; set; }
    public DateOnly? DateFin { get; set; }
    public string Statut { get; set; } = "EnAttente";
    public int Exercice { get; set; } = DateTime.Now.Year;
    public string? Notes { get; set; }
    public DateTime DateCreation { get; set; } = DateTime.Now;
    public DateTime? DateModification { get; set; }
    public Membre Membre { get; set; } = null!;
    public TypeCotisation TypeCotisation { get; set; } = null!;
    public ICollection<Paiement> Paiements { get; set; } = new List<Paiement>();
}