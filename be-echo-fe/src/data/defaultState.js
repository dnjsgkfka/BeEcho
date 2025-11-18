const createDefaultState = () => ({
  version: 1,
  user: {
    name: "user",
    lp: 0,
    streakDays: 0,
    bestStreak: 0,
    totalSuccessCount: 0,
    lastSuccessDate: null,
    lastVerificationDate: null,
  },
  history: [],
  fact: null,
});

export default createDefaultState;
