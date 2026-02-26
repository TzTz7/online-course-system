// exams/exam-detail.tsx
import type { UserRole } from "@/lib/definitions";
import { ExamDetailView } from "./ExamDetailView";
import { getExamDetailLogicData } from "@/lib/exam/exam-detail.logic";

interface ExamDetailProps {
  examId: string;
  userRole: UserRole;
}

// 入口组件：仅负责传参和调用逻辑/展示层
export async function ExamDetail({ examId, userRole }: ExamDetailProps) {
  // 1. 调用逻辑层获取数据
  const { exam, isTeacher, attempts } = await getExamDetailLogicData(examId, userRole);
  
  // 2. 调用展示层渲染UI
  return <ExamDetailView exam={exam} isTeacher={isTeacher} attempts={attempts} />;
}