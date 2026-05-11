export const addOnResumeListener = (listener) => {
  window.addEventListener('focus', listener);
};
