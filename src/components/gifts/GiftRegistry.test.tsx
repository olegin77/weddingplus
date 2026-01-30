import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { GiftRegistry } from "@/components/gifts/GiftRegistry";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
      insert: () => Promise.resolve({ error: null }),
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
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

describe("GiftRegistry", () => {
  it("renders empty state when no gifts", async () => {
    render(<GiftRegistry weddingPlanId="test-plan-id" />, {
      wrapper: createTestWrapper(),
    });

    // Wait for loading to finish
    await screen.findByText(/Реестр подарков/i);
    
    expect(screen.getByText(/Реестр подарков/i)).toBeInTheDocument();
  });

  it("shows add gift buttons", async () => {
    render(<GiftRegistry weddingPlanId="test-plan-id" />, {
      wrapper: createTestWrapper(),
    });

    const addButtons = await screen.findAllByText(/Добавить/i);
    expect(addButtons.length).toBeGreaterThan(0);
  });
});
