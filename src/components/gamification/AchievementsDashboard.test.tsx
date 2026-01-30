import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AchievementsDashboard } from "@/components/gamification/AchievementsDashboard";

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
        order: () => Promise.resolve({ 
          data: [
            { id: "1", code: "first_login", name_ru: "Первые шаги", description_ru: "Начало", icon: "👋", points: 10, category: "onboarding" },
          ], 
          error: null 
        }),
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

describe("AchievementsDashboard", () => {
  it("renders achievements header", async () => {
    render(<AchievementsDashboard weddingPlanId="test-plan-id" />, {
      wrapper: createTestWrapper(),
    });

    await screen.findByText(/Ваши достижения/i);
    expect(screen.getByText(/Ваши достижения/i)).toBeInTheDocument();
  });

  it("displays points counter", async () => {
    render(<AchievementsDashboard weddingPlanId="test-plan-id" />, {
      wrapper: createTestWrapper(),
    });

    await screen.findByText(/очков/i);
    expect(screen.getByText(/очков/i)).toBeInTheDocument();
  });
});
