import AuthMainLayout from "../components/AuthMainLayout";
import MainLayout from "../components/MainLayout";
import AuthMiddleware from "../middleware/AuthMiddleware";
import IndexAbonnement from "../pages/dashboard/abonnement/IndexAbonnement";
import IndexPack from "../pages/dashboard/pack/IndexPack";
import IndexPermission from "../pages/dashboard/permissions/IndexPermission";
import IndexUser from "../pages/dashboard/users/IndexUser";
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
          { path: "packs", element: <IndexPack /> },
          { path: "utilisateurs", element: <IndexUser /> },
          { path: "permissions", element: <IndexPermission /> },
          { path: "packs", element: <IndexPack /> },
          { path: "abonnements", element: <IndexAbonnement /> },
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