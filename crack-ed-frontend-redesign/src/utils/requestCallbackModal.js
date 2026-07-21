export const OPEN_REQUEST_CALLBACK_EVENT = "open-request-callback";

export function openRequestCallbackModal() {
  window.dispatchEvent(new CustomEvent(OPEN_REQUEST_CALLBACK_EVENT));
}
