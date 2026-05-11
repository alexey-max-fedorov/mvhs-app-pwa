export const getItem = async (key) => {
  return localStorage.getItem(key);
};

export const setItem = async (key, item) => {
  localStorage.setItem(key, item);
};
