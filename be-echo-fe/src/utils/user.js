/**
 * 사용자 관련 유틸리티 함수
 */

/**
 * 기본 사용자 데이터 생성
 * @param {Object} firebaseUser - Firebase 사용자 객체
 * @returns {Object} 기본 사용자 데이터
 */
export const createDefaultUserData = (firebaseUser) => {
  return {
    name: firebaseUser.displayName || "사용자",
    username: firebaseUser.displayName || "사용자",
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL || null,
    lp: 0,
    streakDays: 0,
    bestStreak: 0,
    totalSuccessCount: 0,
    lastSuccessDate: null,
    createdAt: new Date().toISOString(),
    groupId: null,
  };
};

/**
 * 사용자 데이터 업데이트 객체 생성
 * @param {Object} firebaseUser - Firebase 사용자 객체
 * @returns {Object} 업데이트할 데이터 객체
 */
export const createUserUpdateData = (firebaseUser) => {
  const updates = {};
  if (firebaseUser.displayName) {
    updates.name = firebaseUser.displayName;
    updates.username = firebaseUser.displayName;
  }
  if (firebaseUser.photoURL) {
    updates.photoURL = firebaseUser.photoURL;
  }
  return updates;
};

/**
 * 사용자 객체 생성 (Firestore 데이터와 Firebase 사용자 데이터 병합)
 * @param {Object} firebaseUser - Firebase 사용자 객체
 * @param {Object} existingData - Firestore의 기존 사용자 데이터
 * @param {Object} updates - 업데이트할 데이터
 * @returns {Object} 병합된 사용자 객체
 */
export const mergeUserData = (
  firebaseUser,
  existingData = {},
  updates = {}
) => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    ...existingData,
    ...updates,
    name:
      firebaseUser.displayName || updates.name || existingData.name || "사용자",
    username:
      firebaseUser.displayName ||
      updates.username ||
      existingData.username ||
      existingData.name ||
      "사용자",
    photoURL:
      firebaseUser.photoURL ||
      updates.photoURL ||
      existingData.photoURL ||
      null,
    groupId: existingData.groupId || null,
    isGroupLeader: existingData.isGroupLeader || false,
  };
};
