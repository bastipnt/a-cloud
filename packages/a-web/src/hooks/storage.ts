export const useStorage = () => {
  // const store = (name: string, value: string | object) => {
  //   if (typeof value === "object") value = JSON.stringify(value);

  //   localStorage.setItem(name, value);
  // };

  const storeEmail = (email: string) => {
    localStorage.setItem("email", email);
  };

  const getEmail = () => {
    return localStorage.getItem("email");
  };

  return { storeEmail, getEmail };
};
