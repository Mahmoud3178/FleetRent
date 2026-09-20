import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  messages = signal<ToastMessage[]>([]);
  private counter = 0;

  private push(text: string, type: ToastMessage['type']) {
    const id = ++this.counter;
    this.messages.update((list) => [...list, { id, text, type }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  success(text: string) {
    this.push(text, 'success');
  }

  error(text: string) {
    this.push(text, 'error');
  }

  info(text: string) {
    this.push(text, 'info');
  }

  dismiss(id: number) {
    this.messages.update((list) => list.filter((m) => m.id !== id));
  }

  /** استخراج رسالة خطأ واضحة من أي HttpErrorResponse */
  extractError(err: any): string {
    if (typeof err?.error === 'string') return err.error;
    if (err?.error?.message) return err.error.message;
    if (err?.message) return err.message;
    return 'حدث خطأ غير متوقع، حاول مرة أخرى';
  }
}
