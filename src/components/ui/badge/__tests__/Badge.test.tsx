import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "../Badge";

describe("Badge", () => {
  it("devrait afficher le contenu du badge", () => {
    render(<Badge>Test Badge</Badge>);

    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("devrait appliquer la variante 'light' par défaut", () => {
    const { container } = render(<Badge>Badge</Badge>);

    const badge = container.querySelector(".inline-flex");
    expect(badge).toHaveClass("bg-brand-50");
  });

  it("devrait appliquer la variante 'solid'", () => {
    const { container } = render(<Badge variant="solid">Badge</Badge>);

    const badge = container.querySelector(".inline-flex");
    expect(badge).toHaveClass("bg-brand-500");
  });

  it("devrait appliquer la couleur 'success'", () => {
    const { container } = render(<Badge color="success">Badge</Badge>);

    const badge = container.querySelector(".inline-flex");
    expect(badge).toHaveClass("bg-success-50");
  });

  it("devrait appliquer la couleur 'error'", () => {
    const { container } = render(<Badge color="error">Badge</Badge>);

    const badge = container.querySelector(".inline-flex");
    expect(badge).toHaveClass("bg-error-50");
  });

  it("devrait appliquer la couleur 'warning'", () => {
    const { container } = render(<Badge color="warning">Badge</Badge>);

    const badge = container.querySelector(".inline-flex");
    expect(badge).toHaveClass("bg-warning-50");
  });

  it("devrait appliquer la taille 'sm'", () => {
    const { container } = render(<Badge size="sm">Badge</Badge>);

    const badge = container.querySelector(".inline-flex");
    expect(badge).toHaveClass("text-theme-xs");
  });

  it("devrait appliquer la taille 'md' par défaut", () => {
    const { container } = render(<Badge>Badge</Badge>);

    const badge = container.querySelector(".inline-flex");
    expect(badge).toHaveClass("text-sm");
  });

  it("devrait afficher l'icône de début", () => {
    render(
      <Badge startIcon={<span>🔔</span>}>
        Notification
      </Badge>
    );

    expect(screen.getByText("🔔")).toBeInTheDocument();
    expect(screen.getByText("Notification")).toBeInTheDocument();
  });

  it("devrait afficher l'icône de fin", () => {
    render(
      <Badge endIcon={<span>✓</span>}>
        Validé
      </Badge>
    );

    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.getByText("Validé")).toBeInTheDocument();
  });

  it("devrait afficher les deux icônes", () => {
    render(
      <Badge startIcon={<span>👤</span>} endIcon={<span>✓</span>}>
        Utilisateur Vérifié
      </Badge>
    );

    expect(screen.getByText("👤")).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.getByText("Utilisateur Vérifié")).toBeInTheDocument();
  });
});
