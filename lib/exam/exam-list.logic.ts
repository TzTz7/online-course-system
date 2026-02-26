// exams/exam-list.logic.ts
import { getExams, getExamAttempts } from "@/lib/data";
import type { UserRole } from "@/lib/definitions";

// 定义考试卡片的逻辑数据类型
export interface ExamCardLogicData {
  isStudent: boolean;
  isTeacher: boolean;
  attemptInfo: { score?: number; status?: string } | null;
  canTake: boolean;
  isCompleted: boolean;
}

// 定义列表页整体逻辑数据类型
export interface ExamListLogicData {
  exams: Awaited<ReturnType<typeof getExams>>["exams"];
}

/**
 * 获取考试列表的基础数据
 */
export async function getExamListLogicData(): Promise<ExamListLogicData> {
  const { exams } = await getExams({ limit: 50 });
  return { exams };
}

/**
 * 计算单张考试卡片的业务逻辑数据
 * @param exam 单条考试数据
 * @param userId 用户ID
 * @param userRole 用户角色
 * @returns 处理后的业务逻辑数据
 */
export async function getExamCardLogicData(
  exam: Awaited<ReturnType<typeof getExams>>["exams"][0],
  userId: string,
  userRole: UserRole
): Promise<ExamCardLogicData> {
  // 角色判断
  const isStudent = userRole === "student";
  const isTeacher = userRole === "teacher" || userRole === "admin";

  // 学生视角：获取考试尝试记录
  let attemptInfo: { score?: number; status?: string } | null = null;
  if (isStudent) {
    const attempts = await getExamAttempts(exam.id, userId);
    if (attempts.length > 0) {
      const lastAttempt = attempts[0];
      attemptInfo = {
        score: lastAttempt.score as number | undefined,
        status: lastAttempt.status,
      };
    }
  }

  // 业务规则判断
  const canTake = isStudent && (!attemptInfo || attemptInfo.status === "in-progress");
  const isCompleted = !!attemptInfo && (attemptInfo.status === "submitted" || attemptInfo.status === "graded");

  return {
    isStudent,
    isTeacher,
    attemptInfo,
    canTake,
    isCompleted,
  };
}