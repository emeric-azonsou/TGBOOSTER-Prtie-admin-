import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";
import ClientActionButtons from "../ClientActionButtons";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("ClientActionButtons", () => {
  const mockRouter = {
    refresh: vi.fn(),
    push: vi.fn(),
  };

  const mockOnSuspend = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    global.confirm = vi.fn(() => true);
  });

  it("renders suspend button for active client", () => {
    render(
      <ClientActionButtons
        clientId="1"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Suspendre")).toBeInTheDocument();
  });

  it('renders "Réactiver" button for suspended client', () => {
    render(
      <ClientActionButtons
        clientId="1"
        currentStatus="suspended"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Réactiver")).toBeInTheDocument();
  });

  it("renders delete button", () => {
    render(
      <ClientActionButtons
        clientId="1"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Supprimer")).toBeInTheDocument();
  });

  it("calls onSuspend when suspend button is clicked", async () => {
    mockOnSuspend.mockResolvedValueOnce(undefined);

    render(
      <ClientActionButtons
        clientId="1"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    const suspendButton = screen.getByText("Suspendre");
    fireEvent.click(suspendButton);

    await waitFor(() => {
      expect(mockOnSuspend).toHaveBeenCalledTimes(1);
    });
  });

  it("shows loading state when suspending", async () => {
    mockOnSuspend.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <ClientActionButtons
        clientId="1"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    const suspendButton = screen.getByText("Suspendre");
    fireEvent.click(suspendButton);

    expect(await screen.findByText("Traitement...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Traitement...")).not.toBeInTheDocument();
    });
  });

  it("refreshes router after successful suspend", async () => {
    mockOnSuspend.mockResolvedValueOnce(undefined);

    render(
      <ClientActionButtons
        clientId="1"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    const suspendButton = screen.getByText("Suspendre");
    fireEvent.click(suspendButton);

    await waitFor(() => {
      expect(mockRouter.refresh).toHaveBeenCalledTimes(1);
    });
  });

  it("shows confirmation dialog before delete", async () => {
    render(
      <ClientActionButtons
        clientId="1"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText("Supprimer");
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith(
      "Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible."
    );
  });

  it("calls onDelete when confirmed", async () => {
    mockOnDelete.mockResolvedValueOnce(undefined);

    render(
      <ClientActionButtons
        clientId="1"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText("Supprimer");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  it("does not call onDelete when confirmation is cancelled", async () => {
    global.confirm = vi.fn(() => false);

    render(
      <ClientActionButtons
        clientId="1"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText("Supprimer");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  it("shows loading state when deleting", async () => {
    mockOnDelete.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <ClientActionButtons
        clientId="1"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText("Supprimer");
    fireEvent.click(deleteButton);

    expect(await screen.findByText("Suppression...")).toBeInTheDocument();
  });

  it("disables buttons while suspend is in progress", async () => {
    mockOnSuspend.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <ClientActionButtons
        clientId="1"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    const suspendButton = screen.getByText("Suspendre");
    const deleteButton = screen.getByText("Supprimer");

    fireEvent.click(suspendButton);

    await waitFor(() => {
      expect(suspendButton).toBeDisabled();
      expect(deleteButton).toBeDisabled();
    });
  });

  it("disables buttons while delete is in progress", async () => {
    mockOnDelete.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <ClientActionButtons
        clientId="1"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    const suspendButton = screen.getByText("Suspendre");
    const deleteButton = screen.getByText("Supprimer");

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(suspendButton).toBeDisabled();
      expect(deleteButton).toBeDisabled();
    });
  });

  it("includes clientId in suspend form data", async () => {
    mockOnSuspend.mockResolvedValueOnce(undefined);

    render(
      <ClientActionButtons
        clientId="test-client-123"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    const suspendButton = screen.getByText("Suspendre");
    fireEvent.click(suspendButton);

    await waitFor(() => {
      expect(mockOnSuspend).toHaveBeenCalled();
      const formData = mockOnSuspend.mock.calls[0][0] as FormData;
      expect(formData.get("clientId")).toBe("test-client-123");
    });
  });

  it("includes clientId in delete form data", async () => {
    mockOnDelete.mockResolvedValueOnce(undefined);

    render(
      <ClientActionButtons
        clientId="test-client-456"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText("Supprimer");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalled();
      const formData = mockOnDelete.mock.calls[0][0] as FormData;
      expect(formData.get("clientId")).toBe("test-client-456");
    });
  });

  it("handles suspend errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockOnSuspend.mockRejectedValueOnce(new Error("Suspend failed"));

    render(
      <ClientActionButtons
        clientId="1"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    const suspendButton = screen.getByText("Suspendre");
    fireEvent.click(suspendButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error suspending client:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("handles delete errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockOnDelete.mockRejectedValueOnce(new Error("Delete failed"));

    render(
      <ClientActionButtons
        clientId="1"
        currentStatus="active"
        onSuspend={mockOnSuspend}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText("Supprimer");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error deleting client:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
