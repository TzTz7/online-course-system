// exams/ExamListView.tsx
import Link from "next/link";
import { ChevronRight, Clock, FileText, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/lib/definitions";
import { ExamCardLogicData } from "@/lib/exam/exam-list.logic";

// 列表页展示组件Props
interface ExamListViewProps {
  exams: Awaited<ReturnType<typeof import("@/lib/data").getExams>>["exams"];
  userId: string;
  userRole: UserRole;
  getExamCardLogicData: (
    exam: Awaited<ReturnType<typeof import("@/lib/data").getExams>>["exams"][0],
    userId: string,
    userRole: UserRole
  ) => Promise<ExamCardLogicData>;
}

/**
 * 考试列表页纯展示组件
 */
export function ExamListView({ exams, userId, userRole, getExamCardLogicData }: ExamListViewProps) {
  // 无考试数据的兜底展示
  if (exams.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">暂无试卷</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {exams.map((exam) => (
        <ExamCard
          key={exam.id}
          exam={exam}
          userId={userId}
          userRole={userRole}
          getExamCardLogicData={getExamCardLogicData}
        />
      ))}
    </div>
  );
}

// 考试卡片展示组件Props
interface ExamCardProps {
  exam: Awaited<ReturnType<typeof import("@/lib/data").getExams>>["exams"][0];
  userId: string;
  userRole: UserRole;
  getExamCardLogicData: (
    exam: Awaited<ReturnType<typeof import("@/lib/data").getExams>>["exams"][0],
    userId: string,
    userRole: UserRole
  ) => Promise<ExamCardLogicData>;
}

/**
 * 考试卡片纯展示组件（异步组件，获取逻辑数据后渲染）
 */
async function ExamCard({ exam, userId, userRole, getExamCardLogicData }: ExamCardProps) {
  // 调用逻辑层方法获取业务数据
  const { isStudent, isTeacher, attemptInfo, canTake, isCompleted } = await getExamCardLogicData(
    exam,
    userId,
    userRole
  );

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-4 space-y-3">
        {/* 考试标题 + 状态徽章 */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{exam.title}</h3>
          {getBadgeContent(isCompleted, canTake, exam.status)}
        </div>

        {/* 考试基础信息 */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {exam.course_name && <span>{exam.course_name}</span>}
          <span>{exam.question_count}题</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {exam.duration}分钟
          </span>
          <span>{exam.total_score}分</span>
        </div>

        {/* 学生已完成：展示得分 + 查看详情 */}
        {isCompleted && attemptInfo?.score !== undefined && (
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-sm font-semibold text-foreground">得分: {attemptInfo.score}</span>
            <Link
              href={`/exams/${exam.id}`}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              查看详情 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* 教师视角：查看成绩入口 */}
        {isTeacher && (
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> 查看成绩
            </span>
            <Link
              href={`/exams/${exam.id}`}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              进入 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* 学生可参加：开始考试按钮 */}
        {isStudent && canTake && (
          <Link
            href={`/exams/${exam.id}`}
            className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors text-center block"
          >
            开始考试
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

// 辅助组件：根据状态返回对应徽章
function getBadgeContent(
  isCompleted: boolean,
  canTake: boolean,
  examStatus: string
) {
  if (isCompleted) {
    return (
      <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-0 text-xs">
        已完成
      </Badge>
    );
  }
  if (canTake) {
    return (
      <Badge className="bg-primary/10 text-primary border-0 text-xs">
        可参加
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs">
      {examStatus}
    </Badge>
  );
}