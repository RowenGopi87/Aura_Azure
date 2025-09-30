import { useState, useCallback } from 'react';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastState {
  toasts: ToastProps[];
}

const toastState: ToastState = {
  toasts: []
};

const listeners: Array<(state: ToastState) => void> = [];

function notifyListeners() {
  listeners.forEach(listener => listener(toastState));
}

let toastId = 0;

function generateToastId() {
  return `toast-${++toastId}`;
}

export function useToast() {
  const [state, setState] = useState(toastState);

  // Subscribe to toast state changes
  useState(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  });

  const toast = useCallback((props: ToastProps) => {
    const id = props.id || generateToastId();
    const duration = props.duration || (props.variant === 'destructive' ? 8000 : 5000);
    
    const toastWithId = { ...props, id };
    
    // Add toast
    toastState.toasts.push(toastWithId);
    notifyListeners();
    
    // Auto-remove toast after duration
    setTimeout(() => {
      dismiss(id);
    }, duration);
    
    return {
      id,
      dismiss: () => dismiss(id),
      update: (updateProps: Partial<ToastProps>) => {
        const index = toastState.toasts.findIndex(t => t.id === id);
        if (index > -1) {
          toastState.toasts[index] = { ...toastState.toasts[index], ...updateProps };
          notifyListeners();
        }
      }
    };
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      toastState.toasts = toastState.toasts.filter(t => t.id !== toastId);
    } else {
      toastState.toasts = [];
    }
    notifyListeners();
  }, []);

  return {
    toast,
    dismiss,
    toasts: state.toasts
  };
}
