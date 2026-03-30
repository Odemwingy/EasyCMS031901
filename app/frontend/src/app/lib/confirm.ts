/**
 * 全局二次确认（与 ConfirmDialogHost 配套）。危险操作请设 variant: "destructive"。
 */
export type ConfirmOptions = {
  title: string;
  description?: string;
  /** 主按钮文案，默认「确定」 */
  confirmLabel?: string;
  /** 次按钮文案，默认「取消」 */
  cancelLabel?: string;
  /** destructive：主按钮红色，用于删除等不可逆操作 */
  variant?: "default" | "destructive";
};

type Pending = ConfirmOptions & {
  resolve: (ok: boolean) => void;
};

let pending: Pending | null = null;
const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((fn) => fn());
}

/** 由 ConfirmDialogHost 挂载时注册 */
export function subscribeConfirmHost(onChange: () => void) {
  subscribers.add(onChange);
  return () => {
    subscribers.delete(onChange);
  };
}

export function getConfirmPending(): Pending | null {
  return pending;
}

export function resolveConfirm(result: boolean) {
  if (!pending) return;
  const { resolve } = pending;
  pending = null;
  resolve(result);
  notify();
}

/**
 * 弹出二次确认，返回用户是否点击主按钮（确定）。
 * 取消、关闭遮罩、Esc 均为 false。
 */
export function openConfirm(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (pending) {
      pending.resolve(false);
    }
    pending = { ...opts, resolve };
    notify();
  });
}
