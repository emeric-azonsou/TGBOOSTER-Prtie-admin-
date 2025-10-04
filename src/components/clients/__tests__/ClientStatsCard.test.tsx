import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ClientStatsCard from "../ClientStatsCard";

describe("ClientStatsCard", () => {
  it("renders label and value correctly", () => {
    render(
      <ClientStatsCard
        label="Total Clients"
        value={150}
        icon="👥"
        iconBgColor="bg-blue-100"
      />
    );

    expect(screen.getByText("Total Clients")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
  });

  it("renders string value correctly", () => {
    render(
      <ClientStatsCard
        label="Revenue"
        value="50,000 FCFA"
        icon="💰"
        iconBgColor="bg-green-100"
      />
    );

    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("50,000 FCFA")).toBeInTheDocument();
  });

  it("renders icon correctly", () => {
    render(
      <ClientStatsCard
        label="Active Campaigns"
        value={25}
        icon="📊"
        iconBgColor="bg-purple-100"
      />
    );

    expect(screen.getByText("📊")).toBeInTheDocument();
  });

  it("applies correct icon background color", () => {
    const { container } = render(
      <ClientStatsCard
        label="Test"
        value={100}
        icon="🎯"
        iconBgColor="bg-red-100"
      />
    );

    const iconContainer = container.querySelector(".bg-red-100");
    expect(iconContainer).toBeInTheDocument();
  });

  it("renders positive trend correctly", () => {
    render(
      <ClientStatsCard
        label="New Clients"
        value={45}
        icon="📈"
        iconBgColor="bg-blue-100"
        trend={{ value: 12.5, label: "vs mois dernier" }}
      />
    );

    expect(screen.getByText(/\+12.5%/)).toBeInTheDocument();
    expect(screen.getByText(/vs mois dernier/)).toBeInTheDocument();
  });

  it("renders negative trend correctly", () => {
    render(
      <ClientStatsCard
        label="Active Users"
        value={80}
        icon="👤"
        iconBgColor="bg-orange-100"
        trend={{ value: -5.2, label: "vs mois dernier" }}
      />
    );

    expect(screen.getByText(/-5.2%/)).toBeInTheDocument();
    expect(screen.getByText(/vs mois dernier/)).toBeInTheDocument();
  });

  it("applies success color for positive trend", () => {
    const { container } = render(
      <ClientStatsCard
        label="Growth"
        value={200}
        icon="🚀"
        iconBgColor="bg-green-100"
        trend={{ value: 15, label: "ce mois" }}
      />
    );

    const trendElement = container.querySelector(".text-success-600");
    expect(trendElement).toBeInTheDocument();
  });

  it("applies error color for negative trend", () => {
    const { container } = render(
      <ClientStatsCard
        label="Decline"
        value={50}
        icon="📉"
        iconBgColor="bg-red-100"
        trend={{ value: -10, label: "ce mois" }}
      />
    );

    const trendElement = container.querySelector(".text-error-600");
    expect(trendElement).toBeInTheDocument();
  });

  it("does not render trend when not provided", () => {
    const { container } = render(
      <ClientStatsCard
        label="Static Stat"
        value={100}
        icon="📌"
        iconBgColor="bg-gray-100"
      />
    );

    expect(screen.queryByText(/vs/)).not.toBeInTheDocument();
    expect(container.querySelector(".text-success-600")).not.toBeInTheDocument();
    expect(container.querySelector(".text-error-600")).not.toBeInTheDocument();
  });

  it("handles zero trend value correctly", () => {
    render(
      <ClientStatsCard
        label="No Change"
        value={100}
        icon="➖"
        iconBgColor="bg-gray-100"
        trend={{ value: 0, label: "stable" }}
      />
    );

    expect(screen.getByText(/\+0%/)).toBeInTheDocument();
    expect(screen.getByText(/stable/)).toBeInTheDocument();
  });
});
