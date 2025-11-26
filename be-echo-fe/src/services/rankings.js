import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * 개인 랭킹
 */
export const getPersonalRankings = async (limitCount = 100) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("lp", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);

    const rankings = [];
    let rank = 1;
    let previousLP = null;
    let currentRank = 1;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const lp = data.lp || 0;

      if (previousLP !== null && lp < previousLP) {
        currentRank = rank;
      }

      rankings.push({
        id: doc.id,
        rank: currentRank,
        name: data.name || "이름 없음",
        photoURL: data.photoURL || null,
        lp: lp,
        streakDays: data.streakDays || 0,
        groupId: data.groupId || null,
        groupName: data.groupName || null,
      });

      rank++;
      previousLP = lp;
    });

    return rankings;
  } catch (error) {
    console.error("개인 랭킹 가져오기 오류:", error);
    return [];
  }
};

/**
 * 그룹 랭킹
 */
export const getGroupRankings = async (limitCount = 100) => {
  try {
    const groupsRef = collection(db, "groups");
    const querySnapshot = await getDocs(groupsRef);

    const groupDataList = [];

    for (const groupDoc of querySnapshot.docs) {
      const groupData = groupDoc.data();
      const membersRef = collection(db, "groups", groupDoc.id, "members");
      const membersSnapshot = await getDocs(membersRef);

      let totalLP = 0;
      membersSnapshot.forEach((memberDoc) => {
        const memberData = memberDoc.data();
        totalLP += memberData.lp || 0;
      });

      groupDataList.push({
        id: groupDoc.id,
        name: groupData.name || "그룹 이름 없음",
        code: groupData.code || "",
        totalLP: totalLP,
        memberCount: groupData.memberCount || membersSnapshot.size,
        leaderId: groupData.leaderId || null,
      });
    }

    groupDataList.sort((a, b) => b.totalLP - a.totalLP);

    const topGroups = groupDataList.slice(0, limitCount);

    const rankings = [];
    let rank = 1;
    let previousLP = null;
    let currentRank = 1;

    topGroups.forEach((group) => {
      if (previousLP !== null && group.totalLP < previousLP) {
        currentRank = rank;
      }

      rankings.push({
        id: group.id,
        rank: currentRank,
        name: group.name,
        code: group.code,
        totalLP: group.totalLP,
        memberCount: group.memberCount,
        leaderId: group.leaderId,
      });

      rank++;
      previousLP = group.totalLP;
    });

    return rankings;
  } catch (error) {
    console.error("그룹 랭킹 가져오기 오류:", error);
    return [];
  }
};

/**
 * 개인 랭킹
 */
export const getUserPersonalRank = async (userId) => {
  try {
    const rankings = await getPersonalRankings(1000);
    const userRanking = rankings.find((r) => r.id === userId);
    return userRanking || null;
  } catch (error) {
    console.error("사용자 개인 랭킹 찾기 오류:", error);
    return null;
  }
};

/**
 * 그룹 랭킹
 */
export const getGroupRank = async (groupId) => {
  try {
    const rankings = await getGroupRankings(1000);
    const groupRanking = rankings.find((r) => r.id === groupId);
    return groupRanking || null;
  } catch (error) {
    console.error("그룹 랭킹 찾기 오류:", error);
    return null;
  }
};
