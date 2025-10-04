import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ClientsTable from "../ClientsTable";
import type { ClientListItem } from "@/types/client.types";

const mockClients: ClientListItem[] = [
  {
    id: "1",
    name: "Jean Dupont",
    email: "jean@example.com",
    company: "TechCorp",
    businessType: "Technology",
    totalCampaigns: 5,
    totalSpent: "50,000 FCFA",
    status: "active",
    lastLogin: "2025-01-15",
    isVerified: true,
  },
  {
    id: "2",
    name: "Marie Martin",
    email: "marie@example.com",
    company: "Fashion Brand",
    businessType: "Retail",
    totalCampaigns: 3,
    totalSpent: "30,000 FCFA",
    status: "pending_verification",
    lastLogin: "2025-01-10",
    isVerified: false,
  },
  {
    id: "3",
    name: "Pierre Dubois",
    email: "pierre@example.com",
    company: null,
    businessType: null,
    totalCampaigns: 0,
    totalSpent: "0 FCFA",
    status: "suspended",
    lastLogin: null,
    isVerified: false,
  },
];

describe("ClientsTable", () => {
  it("renders empty state when no clients", () => {
    render(<ClientsTable clients={[]} />);

    expect(screen.getByText("Aucun client trouvé")).toBeInTheDocument();
  });

  it("renders all clients when provided", () => {
    render(<ClientsTable clients={mockClients} />);

    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    expect(screen.getByText("Marie Martin")).toBeInTheDocument();
    expect(screen.getByText("Pierre Dubois")).toBeInTheDocument();
  });

  it("renders client emails", () => {
    render(<ClientsTable clients={mockClients} />);

    expect(screen.getByText("jean@example.com")).toBeInTheDocument();
    expect(screen.getByText("marie@example.com")).toBeInTheDocument();
    expect(screen.getByText("pierre@example.com")).toBeInTheDocument();
  });

  it("renders company names", () => {
    render(<ClientsTable clients={mockClients} />);

    expect(screen.getByText("TechCorp")).toBeInTheDocument();
    expect(screen.getByText("Fashion Brand")).toBeInTheDocument();
  });

  it("renders business types", () => {
    render(<ClientsTable clients={mockClients} />);

    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Retail")).toBeInTheDocument();
  });

  it("renders campaign counts", () => {
    render(<ClientsTable clients={mockClients} />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders total spent amounts", () => {
    render(<ClientsTable clients={mockClients} />);

    expect(screen.getByText("50,000 FCFA")).toBeInTheDocument();
    expect(screen.getByText("30,000 FCFA")).toBeInTheDocument();
    expect(screen.getByText("0 FCFA")).toBeInTheDocument();
  });

  it("renders active status with success badge", () => {
    render(<ClientsTable clients={[mockClients[0]]} />);

    expect(screen.getByText("Actif")).toBeInTheDocument();
  });

  it("renders pending verification status", () => {
    render(<ClientsTable clients={[mockClients[1]]} />);

    expect(screen.getByText("En attente")).toBeInTheDocument();
  });

  it("renders suspended status", () => {
    render(<ClientsTable clients={[mockClients[2]]} />);

    expect(screen.getByText("Suspendu")).toBeInTheDocument();
  });

  it("renders banned status correctly", () => {
    const bannedClient: ClientListItem = {
      ...mockClients[0],
      status: "banned",
    };

    render(<ClientsTable clients={[bannedClient]} />);

    expect(screen.getByText("Banni")).toBeInTheDocument();
  });

  it('displays "Vérifié" badge for verified clients', () => {
    render(<ClientsTable clients={[mockClients[0]]} />);

    expect(screen.getByText("Vérifié")).toBeInTheDocument();
  });

  it('does not display "Vérifié" badge for unverified clients', () => {
    render(<ClientsTable clients={[mockClients[1]]} />);

    expect(screen.queryByText("Vérifié")).not.toBeInTheDocument();
  });

  it("renders last login dates", () => {
    render(<ClientsTable clients={mockClients} />);

    expect(screen.getByText("2025-01-15")).toBeInTheDocument();
    expect(screen.getByText("2025-01-10")).toBeInTheDocument();
  });

  it('displays "Jamais" when no last login', () => {
    render(<ClientsTable clients={[mockClients[2]]} />);

    expect(screen.getByText("Jamais")).toBeInTheDocument();
  });

  it('displays "-" for missing company', () => {
    render(<ClientsTable clients={[mockClients[2]]} />);

    const cells = screen.getAllByText("-");
    expect(cells.length).toBeGreaterThan(0);
  });

  it('displays "-" for missing business type', () => {
    render(<ClientsTable clients={[mockClients[2]]} />);

    const cells = screen.getAllByText("-");
    expect(cells.length).toBeGreaterThan(0);
  });

  it("renders client names as links", () => {
    render(<ClientsTable clients={mockClients} />);

    const link = screen.getByRole("link", { name: /Jean Dupont/ });
    expect(link).toHaveAttribute("href", "/users/clients/1");
  });

  it("renders all table headers correctly", () => {
    render(<ClientsTable clients={mockClients} />);

    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Entreprise")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Campagnes")).toBeInTheDocument();
    expect(screen.getByText("Total dépensé")).toBeInTheDocument();
    expect(screen.getByText("Statut")).toBeInTheDocument();
    expect(screen.getByText("Dernière connexion")).toBeInTheDocument();
  });

  it("renders correct number of table rows", () => {
    render(<ClientsTable clients={mockClients} />);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(4);
  });
});
