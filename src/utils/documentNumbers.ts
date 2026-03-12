export function generateDocNumber(prefix: string, existingNumbers: string[]): string {
  const year = new Date().getFullYear();
  const pattern = new RegExp(`${prefix}-${year}-(\\d+)`);
  let max = 0;
  existingNumbers.forEach(num => {
    const match = num.match(pattern);
    if (match) max = Math.max(max, parseInt(match[1]));
  });
  const next = (max + 1).toString().padStart(4, '0');
  return `${prefix}-${year}-${next}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
