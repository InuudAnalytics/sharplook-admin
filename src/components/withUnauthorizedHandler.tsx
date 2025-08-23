import { useEffect } from "react";
import type { ComponentType } from "react";
import { useUnauthorized } from "../hooks/useUnauthorized";

interface UnauthorizedErrorDetail {
  message: string;
  status: number;
}

interface WithUnauthorizedHandlerProps {
  onUnauthorized?: (error: UnauthorizedErrorDetail) => void;
}

export function withUnauthorizedHandler<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return function WithUnauthorizedHandlerComponent(
    props: P & WithUnauthorizedHandlerProps
  ) {
    const { showUnauthorized } = useUnauthorized();
    const { onUnauthorized, ...componentProps } = props;

    useEffect(() => {
      const handleUnauthorized = (
        event: CustomEvent<UnauthorizedErrorDetail>
      ) => {
        if (onUnauthorized) {
          onUnauthorized(event.detail);
        } else {
          showUnauthorized(event.detail.message);
        }
      };

      window.addEventListener(
        "unauthorized",
        handleUnauthorized as EventListener
      );

      return () => {
        window.removeEventListener(
          "unauthorized",
          handleUnauthorized as EventListener
        );
      };
    }, [onUnauthorized, showUnauthorized]);

    return <WrappedComponent {...(componentProps as P)} />;
  };
}
