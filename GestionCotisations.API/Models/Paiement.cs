namespace GestionCotisations.API.Models;

public class Paiement
{
    public int Id { get; set; }
    public int CotisationId { get; set; }
    public decimal Montant { get; set; }
    public DateTime DatePaiement { get; set; } = DateTime.Now;
    public string ModePaiement { get; set; } = "Virement";
    public string? Reference { get; set; }
    public string? Remarques { get; set; }
    public int EnregistrePar { get; set; }
    public DateTime DateCreation { get; set; } = DateTime.Now;
    public Cotisation Cotisation { get; set; } = null!;
    public Utilisateur Utilisateur { get; set; } = null!;
}