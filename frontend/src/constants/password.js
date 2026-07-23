export const PASSWORD_MIN_LENGTH = 8;

export const isValidPassword = (password) => (
  password.length >= PASSWORD_MIN_LENGTH
);

export const PASSWORD_REQUIREMENT_TEXT = `At least ${PASSWORD_MIN_LENGTH} characters`;