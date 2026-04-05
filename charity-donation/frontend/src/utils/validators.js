export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const validateDonateForm = ({ amount, name, email }) => {
  const errors = {};
  if (!isValidAmount(amount)) errors.amount = 'Please enter a valid amount';
  if (!name.trim()) errors.name = 'Name is required';
  if (!isValidEmail(email)) errors.email = 'Please enter a valid email';
  return errors;
};