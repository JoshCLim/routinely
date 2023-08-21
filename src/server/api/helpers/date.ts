export const getTodayMidnight = () => {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  return todayMidnight.toISOString();
};

export const getTomorrowMidnight = () => {
  const tmrMidnight = new Date();
  tmrMidnight.setHours(24, 0, 0, 0);

  return tmrMidnight.toISOString();
};
