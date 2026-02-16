export const getMatchScore = (name, query) => {
  if (!query) return 0;

  const text = name.toLowerCase();
  const q = query.toLowerCase();

  if (text === q) return 100;
  if (text.startsWith(q)) return 70;
  if (text.split(" ").includes(q)) return 50;
  if (text.includes(q)) return 30;

  return 0;
};