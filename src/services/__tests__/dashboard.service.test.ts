import { describe, it, expect, vi, beforeEach } from "vitest";
import { DashboardService } from "../dashboard.service";
import type { ExecutionStatus } from "@/types/database.types";

// Mock Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

describe("DashboardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("mapExecutionStatus", () => {
    it("devrait mapper 'completed' en 'Validé'", () => {
      const status: ExecutionStatus = "completed";
      const result = DashboardService["mapExecutionStatus"](status);
      expect(result).toBe("Validé");
    });

    it("devrait mapper 'submitted' en 'En attente'", () => {
      const status: ExecutionStatus = "submitted";
      const result = DashboardService["mapExecutionStatus"](status);
      expect(result).toBe("En attente");
    });

    it("devrait mapper 'rejected' en 'Rejeté'", () => {
      const status: ExecutionStatus = "rejected";
      const result = DashboardService["mapExecutionStatus"](status);
      expect(result).toBe("Rejeté");
    });

    it("devrait retourner le statut par défaut pour les autres cas", () => {
      const status: ExecutionStatus = "assigned";
      const result = DashboardService["mapExecutionStatus"](status);
      expect(result).toBe("En attente");
    });
  });

  describe("formatRelativeTime", () => {
    it("devrait formater le temps relatif pour il y a quelques secondes", () => {
      const now = new Date();
      const dateStr = now.toISOString();
      const result = DashboardService["formatRelativeTime"](dateStr);
      expect(result).toBe("Il y a moins d'une minute");
    });

    it("devrait formater le temps relatif pour il y a X minutes", () => {
      const now = new Date();
      const past = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
      const result = DashboardService["formatRelativeTime"](past.toISOString());
      expect(result).toBe("Il y a 5 minutes");
    });

    it("devrait formater le temps relatif pour il y a X heures", () => {
      const now = new Date();
      const past = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
      const result = DashboardService["formatRelativeTime"](past.toISOString());
      expect(result).toBe("Il y a 3 heures");
    });

    it("devrait formater le temps relatif pour il y a X jours", () => {
      const now = new Date();
      const past = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const result = DashboardService["formatRelativeTime"](past.toISOString());
      expect(result).toBe("Il y a 2 jours");
    });
  });


  describe("getRecentTasks", () => {
    it("devrait retourner un tableau vide en cas d'erreur", async () => {
      const result = await DashboardService.getRecentTasks(5);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("devrait limiter le nombre de résultats", async () => {
      const limit = 3;
      const result = await DashboardService.getRecentTasks(limit);
      expect(result.length).toBeLessThanOrEqual(limit);
    });
  });
});
