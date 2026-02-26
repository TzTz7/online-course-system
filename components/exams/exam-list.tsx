// exams/exam-list.tsx
import type { UserRole } from "@/lib/definitions";
import { ExamListView } from "./ExamListView";
import { getExamCardLogicData, getExamListLogicData } from "@/lib/exam/exam-list.logic";

interface ExamListProps {
  userId: string;
  userRole: UserRole;
}

/**
 * 考试列表页入口组件
 * 仅负责：1. 获取逻辑数据 2. 传递给展示组件
 */
export async function ExamList({ userId, userRole }: ExamListProps) {
  // 1. 调用逻辑层获取列表基础数据
  const { exams } = await getExamListLogicData();

  // 2. 传递数据和逻辑方法给展示组件
  return (
    <ExamListView
      exams={exams}
      userId={userId}
      userRole={userRole}
      getExamCardLogicData={getExamCardLogicData}
    />
  );
}