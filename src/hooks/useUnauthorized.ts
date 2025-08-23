import { useCallback } from "react";
import useAppContext from "../context/useAppContext";

export const useUnauthorized = () => {
  const { setUnauthorizedError, clearUnauthorizedError } = useAppContext();

  const showUnauthorized = useCallback(
    (message?: string) => {
      setUnauthorizedError({
        message:
          message ||
          "You are not authorized to view this page. Please contact your administrator if you believe this is an error.",
        status: 403,
        show: true,
      });
    },
    [setUnauthorizedError]
  );

  const hideUnauthorized = useCallback(() => {
    clearUnauthorizedError();
  }, [clearUnauthorizedError]);

  return {
    showUnauthorized,
    hideUnauthorized,
  };
};
