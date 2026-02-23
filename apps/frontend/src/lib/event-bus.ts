export const EventBusName = {
  SHOW_ALERT: 'SHOW_ALERT',
  OPEN_ZOD_FORM_DIALOG: 'OPEN_ZOD_FORM_DIALOG',
  CLOSE_ZOD_FORM_DIALOG: 'CLOSE_ZOD_FORM_DIALOG',
  OPEN_ZOD_FORM_DRAWER: 'OPEN_ZOD_FORM_DRAWER',
  CLOSE_ZOD_FORM_DRAWER: 'CLOSE_ZOD_FORM_DRAWER',
  OPEN_PREVIEW_FILE: 'OPEN_PREVIEW_FILE',
} as const;
export type EventBusName = (typeof EventBusName)[keyof typeof EventBusName];

class EventBus {
  private eventTarget = new EventTarget();

  emit(eventName: EventBusName, detail?: any) {
    this.eventTarget.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  on(eventName: EventBusName, callback: (data: any) => void) {
    this.eventTarget.addEventListener(eventName, (event) =>
      callback((event as CustomEvent).detail),
    );
  }

  off(eventName: EventBusName, callback: (data: any) => void) {
    this.eventTarget.removeEventListener(eventName, (event) =>
      callback((event as CustomEvent).detail),
    );
  }
}

export const eventBus = new EventBus();
