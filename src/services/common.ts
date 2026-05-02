export const getUserInitial = (name?: string, email?: string): string => {
  if (name) return name[0].toUpperCase();
  if (email) return email[0].toUpperCase();
  return "U";
};
