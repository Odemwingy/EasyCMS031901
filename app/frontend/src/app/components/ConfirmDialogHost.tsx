import { useEffect, useReducer } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { getConfirmPending, resolveConfirm, subscribeConfirmHost } from "../lib/confirm";
import { cn } from "./ui/utils";

/** 挂载在 App 根级，统一承接 openConfirm 弹窗 */
export function ConfirmDialogHost() {
  const [, bump] = useReducer((x: number) => x + 1, 0);
  useEffect(() => subscribeConfirmHost(() => {
    bump();
  }), []);

  const state = getConfirmPending();
  const open = state != null;
  const destructive = state?.variant === "destructive";

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && getConfirmPending()) {
          resolveConfirm(false);
        }
      }}
    >
      <AlertDialogContent className="border-gray-200 shadow-lg sm:max-w-md">
        {state ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900">{state.title}</AlertDialogTitle>
              {state.description ? (
                <AlertDialogDescription className="text-gray-600">{state.description}</AlertDialogDescription>
              ) : null}
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel
                className="border-gray-300 text-gray-700 mt-0"
                onClick={() => resolveConfirm(false)}
              >
                {state.cancelLabel ?? "取消"}
              </AlertDialogCancel>
              <AlertDialogAction
                className={cn(
                  destructive
                    ? "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-600",
                )}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  resolveConfirm(true);
                }}
              >
                {state.confirmLabel ?? "确定"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        ) : null}
      </AlertDialogContent>
    </AlertDialog>
  );
}
