import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { getCurrentUser } from "./api/auth";
import { getToken, logoutToLogin } from "./lib/auth";
import { router } from "./routes";
import { ConfirmDialogHost } from "./components/ConfirmDialogHost";
import { Toaster } from "./components/ui/sonner";

function App() {
  useEffect(() => {
    if (!getToken()) return;

    getCurrentUser().catch(() => {
      logoutToLogin();
    });
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <ConfirmDialogHost />
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
