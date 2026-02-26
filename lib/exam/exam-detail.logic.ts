// exams/exam-detail.logic.ts
import { getExamById, getExamAttempts } from "@/lib/data";
import type { UserRole } from "@/lib/definitions";

// 定义返回的逻辑数据类型
export interface ExamDetailLogicData {
  exam: Awaited<ReturnType<typeof getExamById>>;
  isTeacher: boolean;
  attempts: Awaited<ReturnType<typeof getExamAttempts>>;
}

/**
 * 获取考试详情页的核心数据和业务判断
 * @param examId 考试ID
 * @param userRole 用户角色
 * @returns 处理后的逻辑数据
 */
export async function getExamDetailLogicData(
  examId: string,
  userRole: UserRole
): Promise<ExamDetailLogicData> {
  // 1. 数据获取逻辑
  const exam = await getExamById(examId);
  const attempts = exam ? await getExamAttempts(examId) : [];
  
  // 2. 业务判断逻辑
  const isTeacher = userRole === "teacher" || userRole === "admin";

  return { exam, isTeacher, attempts };
}

/**
 * 辅助函数：判断考试是否通过
 * @param score 得分
 * @param totalScore 总分
 * @returns 是否通过
 */
export function isExamPassed(score: number | null, totalScore: number): boolean {
  return score !== null && score >= totalScore * 0.6;
}