import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RecentTasksTable from "../RecentTasksTable";
import type { RecentTask } from "@/types/dashboard.types";

describe("RecentTasksTable", () => {
  const mockTasks: RecentTask[] = [
    {
      id: "1",
      executant: "Ahmed Kaboré",
      executantId: "exec-123",
      campaign: "Promotion Album 2024",
      campaignId: "camp-456",
      type: "social_follow",
      amount: 3500,
      status: "Validé",
      date: "Il y a 1h",
      submittedAt: new Date().toISOString(),
    },
    {
      id: "2",
      executant: "Marie Dupont",
      executantId: "exec-789",
      campaign: "Challenge #Fashion",
      campaignId: "camp-101",
      type: "social_like",
      amount: 2500,
      status: "En attente",
      date: "Il y a 3h",
      submittedAt: new Date().toISOString(),
    },
  ];

  it("devrait afficher le tableau avec les tâches", () => {
    render(<RecentTasksTable tasks={mockTasks} />);

    expect(screen.getByText("Ahmed Kaboré")).toBeInTheDocument();
    expect(screen.getByText("Marie Dupont")).toBeInTheDocument();
    expect(screen.getByText("Promotion Album 2024")).toBeInTheDocument();
    expect(screen.getByText("Challenge #Fashion")).toBeInTheDocument();
  });

  it("devrait afficher les en-têtes de colonne", () => {
    render(<RecentTasksTable tasks={mockTasks} />);

    expect(screen.getByText("Exécutant")).toBeInTheDocument();
    expect(screen.getByText("Campagne")).toBeInTheDocument();
    expect(screen.getByText("Statut")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
  });


  it("devrait afficher les badges de statut avec les bonnes couleurs", () => {
    const { container } = render(<RecentTasksTable tasks={mockTasks} />);

    const badges = container.querySelectorAll(".inline-flex");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("devrait afficher un message si aucune tâche n'est disponible", () => {
    render(<RecentTasksTable tasks={[]} />);

    expect(screen.getByText("Aucune tâche récente")).toBeInTheDocument();
  });

  it("devrait créer des liens vers les profils des exécutants", () => {
    render(<RecentTasksTable tasks={mockTasks} />);

    const executantLink = screen.getByText("Ahmed Kaboré").closest("a");
    expect(executantLink).toHaveAttribute("href", "/users/executants/exec-123");
  });

  it("devrait créer des liens vers les campagnes", () => {
    render(<RecentTasksTable tasks={mockTasks} />);

    const campaignLink = screen.getByText("Promotion Album 2024").closest("a");
    expect(campaignLink).toHaveAttribute("href", "/campaigns/camp-456");
  });

  it("devrait afficher les dates relatives", () => {
    render(<RecentTasksTable tasks={mockTasks} />);

    expect(screen.getByText("Il y a 1h")).toBeInTheDocument();
    expect(screen.getByText("Il y a 3h")).toBeInTheDocument();
  });
});
