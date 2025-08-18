export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateIssueForm = (form: { description: string; category: string; location: string }): boolean => {
  return !!form.description && !!form.category && !!form.location;
};