import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import "./index.css";
import routes from "./routes/route.jsx";

const queryClient = new QueryClient();

const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true, // Enables relative paths in nested routes
    v7_fetcherPersist: true, // Retains fetcher state during navigation
    v7_normalizeFormMethod: true, // Normalizes form methods (e.g., POST or GET)
    v7_partialHydration: true, // Supports partial hydration for server-side rendering
    v7_skipActionErrorRevalidation: true, // Prevents revalidation when action errors occur
  },
});

createRoot(document.getElementById("root")).render(
  <>
    <Toaster />
    <QueryClientProvider client={queryClient}>
      <RouterProvider future={{ v7_startTransition: true }} router={router} />
    </QueryClientProvider>
  </>
);
