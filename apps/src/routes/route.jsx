import AuthMainLayout from "../components/AuthMainLayout";
import MainLayout from "../components/MainLayout";
import AuthMiddleware from "../middleware/AuthMiddleware";
import IndexApprovisionnement from "../pages/dashboard/approvisionnement/IndexApprovisionnement";
import Dashboard from "../pages/dashboard/Dashboard";
import IndexDepense from "../pages/dashboard/depense/IndexDepense";
import IndexSortie from "../pages/dashboard/mouvement-caisse/IndexMouvement";
import Editions from "../pages/dashboard/Editions";
import IndexPermission from "../pages/dashboard/permissions/IndexPermission";
import IndexTypeDepense from "../pages/dashboard/type-depense/IndexTypeDepense";
import IndexUser from "../pages/dashboard/users/IndexUser";
import AllUser from "../pages/dashboard/users/AllUser";
import NotFoundPage from "../pages/NotFoundPage";

const routes = [
  {
    path: "/",
    element: <AuthMainLayout />,
    children: [
      {
        index: true,
        element: null,
      },
    ],
  },
  {
    element: <AuthMiddleware />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "editions", element: <Editions /> },
          { path: "approvisionnements", element: <IndexApprovisionnement /> },
          { path: "sorties", element: <IndexSortie /> },
          { path: "depenses", element: <IndexDepense /> },
          { path: "type-de-depense", element: <IndexTypeDepense /> },
          { path: "all_utilisateurs", element: <AllUser /> },
          { path: "utilisateurs", element: <IndexUser /> },
          { path: "permissions", element: <IndexPermission /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

export default routes;