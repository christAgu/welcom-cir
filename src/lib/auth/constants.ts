/** Longueur minimale du mot de passe (minimum Supabase hébergé : 6). */
export const MIN_PASSWORD_LENGTH = 6;

export function validatePasswordLength(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
  }
  return null;
}
