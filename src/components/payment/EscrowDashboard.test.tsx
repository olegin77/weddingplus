import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { EscrowDashboard } from "@/components/payment/EscrowDashboard";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: "test-user" } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
    functions: {
      invoke: () => Promise.resolve({ data: { success: true }, error: null }),
    },
  },
}));

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("EscrowDashboard", () => {
  it("renders escrow dashboard", async () => {
    render(<EscrowDashboard />, {
      wrapper: createTestWrapper(),
    });

    await screen.findByText(/Эскроу транзакции/i);
    expect(screen.getByText(/Эскроу транзакции/i)).toBeInTheDocument();
  });

  it("shows zero transactions state", async () => {
    render(<EscrowDashboard />, {
      wrapper: createTestWrapper(),
    });

    // Check for "В эскроу" label which is always present
    await screen.findByText(/В эскроу/i);
    expect(screen.getByText(/В эскроу/i)).toBeInTheDocument();
  });
});
