import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "../StatCard";

describe("StatCard", () => {
  const defaultProps = {
    title: "Campagnes Actives",
    value: 45,
    icon: "📊",
    iconBgColor: "bg-brand-50",
  };

  it("devrait afficher le titre et la valeur", () => {
    render(<StatCard {...defaultProps} />);

    expect(screen.getByText("Campagnes Actives")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
  });

  it("devrait afficher l'icône", () => {
    render(<StatCard {...defaultProps} />);

    expect(screen.getByText("📊")).toBeInTheDocument();
  });

  it("devrait afficher le badge de tendance avec un nombre positif", () => {
    render(<StatCard {...defaultProps} trend={12} trendLabel="ce mois" />);

    expect(screen.getByText(/\+12%/)).toBeInTheDocument();
    expect(screen.getByText(/ce mois/)).toBeInTheDocument();
  });

  it("devrait afficher le badge de tendance avec un nombre négatif", () => {
    render(<StatCard {...defaultProps} trend={-8} />);

    expect(screen.getByText(/-8%/)).toBeInTheDocument();
  });

  it("ne devrait pas afficher de badge si trend est undefined", () => {
    const { container } = render(<StatCard {...defaultProps} />);

    const badge = container.querySelector(".inline-flex");
    expect(badge).not.toBeInTheDocument();
  });

  it("devrait afficher une valeur de type string", () => {
    render(<StatCard {...defaultProps} value="25,000 FCFA" />);

    expect(screen.getByText("25,000 FCFA")).toBeInTheDocument();
  });

  it("devrait appliquer la couleur de fond de l'icône", () => {
    const { container } = render(<StatCard {...defaultProps} iconBgColor="bg-success-50" />);

    const iconContainer = container.querySelector(".bg-success-50");
    expect(iconContainer).toBeInTheDocument();
  });
});
