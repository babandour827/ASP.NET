using GestionCotisations.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionCotisations.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Role> Roles { get; set; }
    public DbSet<Utilisateur> Utilisateurs { get; set; }
    public DbSet<Membre> Membres { get; set; }
    public DbSet<TypeCotisation> TypeCotisations { get; set; }
    public DbSet<Cotisation> Cotisations { get; set; }
    public DbSet<Paiement> Paiements { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Utilisateur>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Utilisateurs)
            .HasForeignKey(u => u.RoleId);

        modelBuilder.Entity<Paiement>()
            .HasOne(p => p.Utilisateur)
            .WithMany(u => u.Paiements)
            .HasForeignKey(p => p.EnregistrePar)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Paiement>()
            .HasOne(p => p.Cotisation)
            .WithMany(c => c.Paiements)
            .HasForeignKey(p => p.CotisationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Cotisation>()
            .HasOne(c => c.Membre)
            .WithMany(m => m.Cotisations)
            .HasForeignKey(c => c.MembreId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Membre)
            .WithMany(m => m.Notifications)
            .HasForeignKey(n => n.MembreId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}