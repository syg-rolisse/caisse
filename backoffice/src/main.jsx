import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import "./index.css";
import routes from "./routes/route.jsx";

import { SocketProvider } from "./context/socket.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

const queryClient = new QueryClient();

// 👇 CORRECTION : Définir TOUS les drapeaux ici, une seule fois.
const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});

createRoot(document.getElementById("root")).render(
  <>
    <Toaster 
      position="top-right" 
      gutter={8}
      containerStyle={{ zIndex: 99999 }}
    />
    
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <AuthProvider>
          {/* 👇 CORRECTION : Ne plus passer de prop 'future' ici. */}
          <RouterProvider router={router} />
        </AuthProvider>
      </SocketProvider>
    </QueryClientProvider>
  </>
);