import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ClientCampaignsList from "../ClientCampaignsList";
import type { ClientCampaign } from "@/types/client.types";

const mockCampaigns: ClientCampaign[] = [
  {
    id: "1",
    title: "Summer Campaign",
    type: "Followers",
    budget: "10,000 FCFA",
    spent: "7,500 FCFA",
    progress: 75,
    status: "active",
  },
  {
    id: "2",
    title: "Product Launch",
    type: "Views",
    budget: "20,000 FCFA",
    spent: "20,000 FCFA",
    progress: 100,
    status: "completed",
  },
  {
    id: "3",
    title: "Brand Awareness",
    type: "Engagement",
    budget: "15,000 FCFA",
    spent: "5,000 FCFA",
    progress: 33,
    status: "paused",
  },
];

describe("ClientCampaignsList", () => {
  it("renders empty state when no campaigns", () => {
    render(<ClientCampaignsList campaigns={[]} />);

    expect(screen.getByText("Aucune campagne pour ce client")).toBeInTheDocument();
  });

  it("renders all campaigns when provided", () => {
    render(<ClientCampaignsList campaigns={mockCampaigns} />);

    expect(screen.getByText("Summer Campaign")).toBeInTheDocument();
    expect(screen.getByText("Product Launch")).toBeInTheDocument();
    expect(screen.getByText("Brand Awareness")).toBeInTheDocument();
  });

  it("renders campaign types correctly", () => {
    render(<ClientCampaignsList campaigns={mockCampaigns} />);

    expect(screen.getByText("Followers")).toBeInTheDocument();
    expect(screen.getByText("Views")).toBeInTheDocument();
    expect(screen.getByText("Engagement")).toBeInTheDocument();
  });

  it("renders budget and spent amounts", () => {
    render(<ClientCampaignsList campaigns={mockCampaigns} />);

    expect(screen.getByText("10,000 FCFA")).toBeInTheDocument();
    expect(screen.getByText("7,500 FCFA")).toBeInTheDocument();
    expect(screen.getAllByText("20,000 FCFA").length).toBeGreaterThan(0);
    expect(screen.getByText("5,000 FCFA")).toBeInTheDocument();
  });

  it("renders progress percentages correctly", () => {
    render(<ClientCampaignsList campaigns={mockCampaigns} />);

    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();
  });

  it("renders active status with success badge", () => {
    render(<ClientCampaignsList campaigns={[mockCampaigns[0]]} />);

    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders completed status with info badge", () => {
    render(<ClientCampaignsList campaigns={[mockCampaigns[1]]} />);

    expect(screen.getByText("Terminée")).toBeInTheDocument();
  });

  it("renders paused status with warning badge", () => {
    render(<ClientCampaignsList campaigns={[mockCampaigns[2]]} />);

    expect(screen.getByText("En pause")).toBeInTheDocument();
  });

  it("renders draft status correctly", () => {
    const draftCampaign: ClientCampaign = {
      id: "4",
      title: "Draft Campaign",
      type: "Likes",
      budget: "5,000 FCFA",
      spent: "0 FCFA",
      progress: 0,
      status: "draft",
    };

    render(<ClientCampaignsList campaigns={[draftCampaign]} />);

    expect(screen.getByText("Brouillon")).toBeInTheDocument();
  });

  it("renders cancelled status correctly", () => {
    const cancelledCampaign: ClientCampaign = {
      id: "5",
      title: "Cancelled Campaign",
      type: "Comments",
      budget: "8,000 FCFA",
      spent: "2,000 FCFA",
      progress: 25,
      status: "cancelled",
    };

    render(<ClientCampaignsList campaigns={[cancelledCampaign]} />);

    expect(screen.getByText("Annulée")).toBeInTheDocument();
  });

  it("renders campaign titles as links", () => {
    render(<ClientCampaignsList campaigns={mockCampaigns} />);

    const link = screen.getByRole("link", { name: "Summer Campaign" });
    expect(link).toHaveAttribute("href", "/campaigns/1");
  });

  it("renders table headers correctly", () => {
    render(<ClientCampaignsList campaigns={mockCampaigns} />);

    expect(screen.getByText("Titre")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Budget")).toBeInTheDocument();
    expect(screen.getByText("Dépensé")).toBeInTheDocument();
    expect(screen.getByText("Progression")).toBeInTheDocument();
    expect(screen.getByText("Statut")).toBeInTheDocument();
  });

  it("renders progress bar for each campaign", () => {
    const { container } = render(<ClientCampaignsList campaigns={mockCampaigns} />);

    const progressBars = container.querySelectorAll(".bg-brand-500");
    expect(progressBars).toHaveLength(3);
  });

  it("sets correct progress bar width", () => {
    const { container } = render(<ClientCampaignsList campaigns={[mockCampaigns[0]]} />);

    const progressBar = container.querySelector(".bg-brand-500");
    expect(progressBar).toHaveStyle({ width: "75%" });
  });

  it("caps progress at 100%", () => {
    const overProgressCampaign: ClientCampaign = {
      id: "6",
      title: "Over Budget",
      type: "Followers",
      budget: "10,000 FCFA",
      spent: "12,000 FCFA",
      progress: 120,
      status: "active",
    };

    const { container } = render(<ClientCampaignsList campaigns={[overProgressCampaign]} />);

    const progressBar = container.querySelector(".bg-brand-500");
    expect(progressBar).toHaveStyle({ width: "100%" });
  });
});
