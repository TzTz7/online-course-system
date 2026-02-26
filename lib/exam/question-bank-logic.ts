import type { Question, QuestionCard, QuestionType, UserRole } from "@/lib/definitions";

// 解析题目选项 - 从 JSON 字符串解析为 string[]
export const parseQuestionOptions = (opts: string[] | null): string[] | null => {
  if (!opts) return null;
  if (Array.isArray(opts)) return opts;
  if (typeof opts === 'string') {
    try {
      const parsed = JSON.parse(opts);
      if (Array.isArray(parsed)) return parsed;
      return null;
    } catch {
      return null;
    }
  }
  return null;
};

// 解析正确答案 - 返回正确答案的文本表示（用于显示）
export const parseQuestionAnswer = (
  answer: string | null,
  questionType: QuestionType,
  options: string[] | null
): string => {
  if (!answer) return "暂无答案";

  try {
    switch (questionType) {
      case 'single_choice': {
        // 单选: 去掉外层引号后显示
        let displayAnswer = answer;
        if (displayAnswer.startsWith('"') && displayAnswer.endsWith('"')) {
          displayAnswer = displayAnswer.slice(1, -1);
        }
        // 转换为选项文本
        if (options) {
          const idx = displayAnswer.toUpperCase().charCodeAt(0) - 65;
          if (idx >= 0 && idx < options.length) {
            return options[idx];
          }
        }
        return displayAnswer;
      }

      case 'multiple_choice': {
        // 多选: '["A","B"]' → 解析数组后返回选项文本
        const arr = JSON.parse(answer);
        if (Array.isArray(arr) && options) {
          return arr.map((val: string) => {
            const idx = val.toUpperCase().charCodeAt(0) - 65;
            if (idx >= 0 && idx < options.length) {
              return options[idx];
            }
            return val;
          }).join(", ");
        }
        return answer;
      }

      case 'true_false': {
        // 是非: 去掉外层引号后显示
        let displayAnswer = answer;
        if (displayAnswer.startsWith('"') && displayAnswer.endsWith('"')) {
          displayAnswer = displayAnswer.slice(1, -1);
        }
        return displayAnswer;
      }

      case 'fill_blank':
      case 'essay': {
        // 填空/简答: 去掉 JSON 字符串外层引号后显示
        let displayAnswer = answer;
        if (displayAnswer.startsWith('"') && displayAnswer.endsWith('"')) {
          displayAnswer = displayAnswer.slice(1, -1);
        }
        return displayAnswer;
      }

      default:
        return answer;
    }
  } catch {
    return answer;
  }
};

// 判断用户答案是否正确
export const checkAnswer = (
  userAnswer: string,
  correctAnswer: string | null,
  questionType: QuestionType
): boolean => {
  if (!userAnswer || !correctAnswer) return false;

  const user = userAnswer.trim().toLowerCase();
  const correct = correctAnswer.trim().toLowerCase();

  switch (questionType) {
    case 'single_choice': {
      // 单选: 去掉 JSON 字符串外层引号后比较
      let normalizedCorrect = correctAnswer.trim();
      if (normalizedCorrect.startsWith('"') && normalizedCorrect.endsWith('"')) {
        normalizedCorrect = normalizedCorrect.slice(1, -1);
      }
      return user === normalizedCorrect.toLowerCase();
    }

    case 'true_false': {
      // 是非: 去掉 JSON 字符串外层引号后比较
      let normalizedCorrect = correctAnswer.trim();
      // 去掉外层引号（如 "true" → true）
      if (normalizedCorrect.startsWith('"') && normalizedCorrect.endsWith('"')) {
        normalizedCorrect = normalizedCorrect.slice(1, -1);
      }
      return user === normalizedCorrect.toLowerCase();
    }

    case 'fill_blank':
    case 'essay': {
      // 填空/简答: 去掉 JSON 字符串外层引号后比较
      let normalizedCorrect = correctAnswer.trim();
      // 去掉外层引号（如 "哈希..." → 哈希...）
      if (normalizedCorrect.startsWith('"') && normalizedCorrect.endsWith('"')) {
        normalizedCorrect = normalizedCorrect.slice(1, -1);
      }
      
      const normalizedUser = userAnswer.trim().toLowerCase();
      return normalizedUser === normalizedCorrect.toLowerCase();
    }

    case 'multiple_choice': {
      // 多选: 比较两个数组
      try {
        // 用户答案可能是 JSON 字符串或已经是数组
        let userArr: string[];
        if (userAnswer.startsWith('[')) {
          userArr = JSON.parse(userAnswer);
        } else {
          userArr = [userAnswer];
        }

        // 正确答案
        let correctArr: string[];
        if (correctAnswer.startsWith('[')) {
          correctArr = JSON.parse(correctAnswer);
        } else {
          correctArr = [correctAnswer];
        }

        if (!Array.isArray(userArr) || !Array.isArray(correctArr)) return false;
        if (userArr.length !== correctArr.length) return false;

        const sortedUser = userArr.map(v => String(v).trim().toLowerCase()).sort();
        const sortedCorrect = correctArr.map(v => String(v).trim().toLowerCase()).sort();
        return sortedUser.every((v, i) => v === sortedCorrect[i]);
      } catch {
        return false;
      }
    }

    default:
      return user === correct;
  }
};

// 题目类型映射
export const questionTypeLabels: Record<QuestionType, string> = {
  single_choice: "单选题",
  multiple_choice: "多选题",
  true_false: "是非题",
  fill_blank: "填空题",
  essay: "论述题"
};

// 判断是否为教师/管理员角色
export const isTeacherRole = (userRole: UserRole): boolean => {
  return userRole === "teacher" || userRole === "admin";
};
