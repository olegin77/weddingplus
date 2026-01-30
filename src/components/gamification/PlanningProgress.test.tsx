import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { PlanningProgress } from "@/components/gamification/PlanningProgress";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ 
            data: [
              { id: "1", milestone_type: "budget", title: "Составить бюджет", completed_at: null, order_index: 1, is_required: true },
              { id: "2", milestone_type: "venue", title: "Выбрать площадку", completed_at: "2026-01-15", order_index: 2, is_required: true },
            ], 
            error: null 
          }),
        }),
      }),
      insert: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
      update: () => ({
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

describe("PlanningProgress", () => {
  it("renders progress header", async () => {
    render(<PlanningProgress weddingPlanId="test-plan-id" />, {
      wrapper: createTestWrapper(),
    });

    await screen.findByText(/Прогресс планирования/i);
    expect(screen.getByText(/Прогресс планирования/i)).toBeInTheDocument();
  });

  it("shows milestone list header", async () => {
    render(<PlanningProgress weddingPlanId="test-plan-id" />, {
      wrapper: createTestWrapper(),
    });

    await screen.findByText(/Этапы подготовки/i);
    expect(screen.getByText(/Этапы подготовки/i)).toBeInTheDocument();
  });

  it("displays days until wedding when date provided", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 100);
    
    render(
      <PlanningProgress 
        weddingPlanId="test-plan-id" 
        weddingDate={futureDate.toISOString()} 
      />, 
      { wrapper: createTestWrapper() }
    );

    await screen.findByText(/дней до свадьбы/i);
    expect(screen.getByText(/дней до свадьбы/i)).toBeInTheDocument();
  });
});
