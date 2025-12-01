import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { storage, db } from "../config/firebase";
import { getLocalDateString } from "../utils/date";
import { VERIFICATION_LP, GROUP_BONUS_LP } from "../constants/app";
import { logError } from "../utils/logger";

/**
 * DataURL을 Blob으로 변환
 */
const dataURLtoBlob = (dataURL) => {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * 이미지를 Firebase Storage에 업로드하고 URL 반환
 * @param {string} imageDataUrl - Base64 이미지 데이터 URL
 * @param {string} userId - 사용자 ID
 * @returns {Promise<string>} 이미지 다운로드 URL
 */
export const uploadVerificationImage = async (imageDataUrl, userId) => {
  try {
    const timestamp = Date.now();
    const fileName = `verifications/${userId}/${timestamp}.jpg`;
    const storageRef = ref(storage, fileName);

    const blob = dataURLtoBlob(imageDataUrl);
    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    logError("이미지 업로드 오류:", error);
    throw error;
  }
};

/**
 * 오늘 인증했는지 확인
 * @param {string} userId - 사용자 ID
 * @returns {Promise<boolean>} 오늘 인증 여부
 */
export const checkTodayVerification = async (userId) => {
  try {
    const today = new Date();
    const todayStr = getLocalDateString(today);

    const verificationsRef = collection(db, "verifications");
    const q = query(
      verificationsRef,
      where("userId", "==", userId),
      where("date", "==", todayStr),
      where("success", "==", true)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    logError("오늘 인증 확인 오류:", error);
    return false;
  }
};

/**
 * 스트릭 계산
 * @param {number} currentStreak - 현재 스트릭
 * @param {string} lastSuccessDate - 마지막 성공 날짜 (ISO string)
 * @returns {number} 업데이트된 스트릭
 */

const calculateStreak = (currentStreak, lastSuccessDate) => {
  const today = new Date();
  const todayStr = getLocalDateString(today);

  if (!lastSuccessDate) {
    return 1;
  }

  const lastDate = new Date(lastSuccessDate);
  const lastDateStr = getLocalDateString(lastDate);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  if (lastDateStr === yesterdayStr) {
    return currentStreak + 1;
  } else if (lastDateStr === todayStr) {
    return currentStreak;
  } else {
    return 1;
  }
};

/**
 * 인증 기록을 Firestore에 저장하고 사용자 통계 업데이트
 * @param {object} params - 인증 정보
 * @param {string} params.userId - 사용자 ID
 * @param {string} params.userName - 사용자 이름
 * @param {string} params.groupId - 그룹 ID (선택)
 * @param {string} params.imageUrl - 이미지 URL
 * @param {boolean} params.success - 인증 성공 여부
 * @param {number} params.confidence - 신뢰도 (선택)
 * @returns {Promise<object>} 저장된 인증 기록
 */
export const saveVerification = async ({
  userId,
  userName,
  groupId,
  imageUrl,
  success,
  confidence,
}) => {
  try {
    const now = new Date();
    const verificationRef = doc(collection(db, "verifications"));
    // 로컬 시간대 기준으로 날짜 저장
    const dateStr = getLocalDateString(now);
    const verificationData = {
      userId,
      userName: userName || "사용자",
      groupId: groupId || null,
      imageUrl,
      success: Boolean(success),
      confidence: confidence || null,
      verifiedAt: serverTimestamp(),
      date: dateStr,
      createdAt: serverTimestamp(),
    };

    await setDoc(verificationRef, verificationData);

    if (success) {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      const currentStreak = userData.streakDays || 0;
      const newStreak = calculateStreak(
        currentStreak,
        userData.lastSuccessDate
      );
      const newBestStreak = Math.max(newStreak, userData.bestStreak || 0);
      const newTotalSuccessCount = (userData.totalSuccessCount || 0) + 1;
      const newLP = (userData.lp || 0) + VERIFICATION_LP;

      await updateDoc(userRef, {
        lp: newLP,
        streakDays: newStreak,
        bestStreak: newBestStreak,
        totalSuccessCount: newTotalSuccessCount,
        lastSuccessDate: now.toISOString(),
      });

      if (groupId) {
        const memberRef = doc(db, "groups", groupId, "members", userId);
        const memberDoc = await getDoc(memberRef);

        if (memberDoc.exists()) {
          await updateDoc(memberRef, {
            lp: newLP,
            streakDays: newStreak,
          });
        }

        await checkAndGiveGroupBonus(groupId, now);
      }
    }

    return {
      id: verificationRef.id,
      ...verificationData,
    };
  } catch (error) {
    logError("인증 기록 저장 오류:", error);
    throw error;
  }
};

/**
 * 모든 멤버가 인증했는지 확인하고 보너스 LP 지급
 * @param {string} groupId - 그룹 ID
 * @param {Date} today - 오늘 날짜
 * @returns {Promise<void>}
 */
const checkAndGiveGroupBonus = async (groupId, today) => {
  try {
    const todayStr = getLocalDateString(today);
    const todayTimestamp = Timestamp.fromDate(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = Timestamp.fromDate(tomorrow);

    const membersRef = collection(db, "groups", groupId, "members");
    const membersSnapshot = await getDocs(membersRef);
    const allMemberIds = membersSnapshot.docs.map((doc) => doc.id);

    if (allMemberIds.length === 0) return;

    const verificationsRef = collection(db, "verifications");
    const verifiedQuery = query(
      verificationsRef,
      where("groupId", "==", groupId),
      where("success", "==", true),
      where("date", "==", todayStr)
    );

    const verifiedSnapshot = await getDocs(verifiedQuery);
    const verifiedMemberIds = new Set(
      verifiedSnapshot.docs.map((doc) => doc.data().userId)
    );

    const allVerified = allMemberIds.every((memberId) =>
      verifiedMemberIds.has(memberId)
    );

    if (allVerified) {
      const groupRef = doc(db, "groups", groupId);
      const groupDoc = await getDoc(groupRef);

      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        const lastBonusDate = groupData.lastBonusDate;

        if (lastBonusDate !== todayStr) {
          const batch = writeBatch(db);

          const userUpdates = [];
          membersSnapshot.docs.forEach((memberDoc) => {
            const memberId = memberDoc.id;
            const memberData = memberDoc.data();
            const newMemberLP = (memberData.lp || 0) + GROUP_BONUS_LP;

            const memberRef = doc(db, "groups", groupId, "members", memberId);
            batch.update(memberRef, { lp: newMemberLP });

            const userRef = doc(db, "users", memberId);
            userUpdates.push(
              getDoc(userRef).then((userDoc) => {
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  const newUserLP = (userData.lp || 0) + GROUP_BONUS_LP;
                  batch.update(userRef, { lp: newUserLP });
                }
              })
            );
          });

          await Promise.all(userUpdates);

          batch.update(groupRef, { lastBonusDate: todayStr });

          await batch.commit();
        }
      }
    }
  } catch (error) {
    logError("그룹 보너스 확인 오류:", error);
  }
};

/**
 * 최근 인증 기록 목록
 */
export const getRecentVerifications = async (userId, limitCount = 6) => {
  try {
    const verificationsRef = collection(db, "verifications");
    const q = query(
      verificationsRef,
      where("userId", "==", userId),
      where("success", "==", true),
      orderBy("verifiedAt", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const timestamp =
        data.verifiedAt?.toDate?.() || data.createdAt?.toDate?.() || new Date();

      return {
        id: doc.id,
        timestamp: timestamp.toISOString(),
        success: data.success,
        imageUrl: data.imageUrl,
        imageDataUrl: data.imageUrl,
        confidence: data.confidence,
        date: data.date,
      };
    });
  } catch (error) {
    if (error.code === "failed-precondition") {
      logError("Firebase 인덱스가 필요합니다.", error);
      const verificationsRef = collection(db, "verifications");
      const q = query(
        verificationsRef,
        where("userId", "==", userId),
        where("success", "==", true)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => {
        const data = doc.data();
        const timestamp =
          data.verifiedAt?.toDate?.() ||
          data.createdAt?.toDate?.() ||
          new Date();
        return {
          id: doc.id,
          timestamp: timestamp.toISOString(),
          success: data.success,
          imageUrl: data.imageUrl,
          imageDataUrl: data.imageUrl,
          confidence: data.confidence,
          date: data.date,
        };
      });
      return results
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limitCount);
    }
    logError("최근 인증 기록 가져오기 오류:", error);
    return [];
  }
};

/**
 * 성공 날짜 목록
 */
export const getVerifiedDates = async (userId) => {
  try {
    const verificationsRef = collection(db, "verifications");
    const q = query(
      verificationsRef,
      where("userId", "==", userId),
      where("success", "==", true)
    );

    const snapshot = await getDocs(q);
    const dates = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        if (data.date) {
          const [year, month, day] = data.date.split("-").map(Number);
          return new Date(year, month - 1, day).toISOString();
        }
        if (data.verifiedAt?.toDate) {
          return data.verifiedAt.toDate().toISOString();
        }
        if (data.createdAt?.toDate) {
          return data.createdAt.toDate().toISOString();
        }
        return null;
      })
      .filter(Boolean);

    return dates;
  } catch (error) {
    logError("인증 날짜 가져오기 오류:", error);
    return [];
  }
};
