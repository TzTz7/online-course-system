// exams/exam-taking.logic.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createExamAttempt, updateExamAttempt, submitExam } from "@/lib/exam-actions";
import type { Exam, ExamQuestion, QuestionBank } from "@/lib/definitions";

// 解析选项数据
export const parseOptions = (opts: any): { id: string; text: string }[] | null => {
  if (!opts) return null;

  // 数组类型
  if (Array.isArray(opts)) {
    const result = opts
      .map((opt: any, idx: number) => {
        const id = opt.id ?? opt.value ?? opt.key ?? String(idx + 1);
        const text = opt.text ?? opt.label ?? opt.value ?? opt.name ?? String(opt) ?? "";
        return { id: String(id), text: String(text) };
      })
      .filter((opt: any) => opt.text);
    return result.length > 0 ? result : null;
  }

  // 字符串类型
  if (typeof opts === "string") {
    try {
      const parsed = JSON.parse(opts);
      if (Array.isArray(parsed)) {
        const result = parsed
          .map((opt: any, idx: number) => {
            const id = opt.id ?? opt.value ?? opt.key ?? String(idx + 1);
            const text = opt.text ?? opt.label ?? opt.value ?? opt.name ?? String(opt) ?? "";
            return { id: String(id), text: String(text) };
          })
          .filter((opt: any) => opt.text);
        return result.length > 0 ? result : null;
      }
      // 逗号分隔的字符串
      if (opts.includes(",")) {
        return opts.split(",").map((opt: string, idx: number) => ({
          id: String(idx + 1),
          text: opt.trim(),
        }));
      }
    } catch {
      return null;
    }
  }

  return null;
};

// 题型标签映射
export const typeLabels: Record<string, string> = {
  single_choice: "单选题",
  multi_choice: "多选题",
  fill_blank: "填空题",
  short_answer: "简答题",
  essay: "论述题",
  true_false: "是非题",
};

// 格式化时间
export const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// 答案正确性校验
export const checkAnswerEqual = (
  userAnswers: string[] | undefined,
  correctAnswer: any,
  question: QuestionBank & { score: number; sort_order: number }
): boolean => {
  if (!userAnswers || userAnswers.length === 0) return false;
  if (!correctAnswer) return false;

  const options = parseOptions(question.options) as { id: string; text: string }[] | null;

  const getOptionLetter = (optionId: string): string => {
    if (!options) return optionId;
    let idx = options.findIndex((o) => String(o.id) === String(optionId));
    if (idx < 0) {
      idx = options.findIndex((o) => o.text.toLowerCase() === optionId.toLowerCase());
    }
    if (idx < 0) {
      const num = parseInt(optionId);
      if (!isNaN(num) && num > 0 && num <= options.length) {
        idx = num - 1;
      }
    }
    if (idx >= 0) {
      return String.fromCharCode(65 + idx);
    }
    return String(optionId).toUpperCase();
  };

  const userSet = new Set(userAnswers.map((a) => getOptionLetter(a)));

  let correctValues: string[] = [];

  if (typeof correctAnswer === "string") {
    correctValues = [correctAnswer];
  } else if (Array.isArray(correctAnswer)) {
    correctValues = correctAnswer.map((a: any) => String(a.id ?? a));
  } else if (typeof correctAnswer === "object" && correctAnswer !== null) {
    correctValues = [String(correctAnswer.id ?? correctAnswer.value ?? JSON.stringify(correctAnswer))];
  }

  if (correctValues.length === 0) return false;

  const correctSet = new Set(correctValues.map((c) => c.toLowerCase()));

  if (userSet.size !== correctSet.size) return false;

  for (const val of correctSet) {
    if (!userSet.has(val)) return false;
  }

  return true;
};

// 核心逻辑Hook
export const useExamTakingLogic = (exam: Exam & { questions: ExamQuestion[] }, userId: string) => {
  const router = useRouter();
  const questions = exam.questions.map((eq) => eq.question).filter(Boolean) as (QuestionBank & {
    score: number;
    sort_order: number;
  })[];

  // 状态管理
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ score: number; correctCount: number } | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // 处理答案选择
  const handleAnswer = (questionId: string, optionId: string, questionType: string) => {
    if (questionType === "multi_choice") {
      // 多选题 - 切换选择
      setAnswers((prev) => {
        const current = prev[questionId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...current, optionId] };
        }
      });
    } else {
      // 单选题/其他 - 单选
      setAnswers((prev) => ({ ...prev, [questionId]: [optionId] }));
    }
  };

  // 检查选项是否选中
  const isOptionSelected = (questionId: string, optionId: string): boolean => {
    const selected = answers[questionId] || [];
    return selected.includes(optionId);
  };

  // 初始化考试记录
  useEffect(() => {
    const initAttempt = async () => {
      const attempt = await createExamAttempt({
        exam_id: exam.id,
        user_id: userId,
        total_score: exam.total_score,
      });
      if (attempt) {
        setAttemptId(attempt.id);
      }
    };
    initAttempt();
  }, [exam.id, userId, exam.total_score]);

  // 倒计时逻辑
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  // 提交试卷
  const handleSubmit = async () => {
    console.log("=== Handle Submit Called ===");
    console.log("attemptId:", attemptId);
    console.log("exam.id:", exam.id);
    console.log("answers:", answers);

    if (!attemptId || !exam.id) {
      console.error("Missing attemptId or exam.id!");
      setIsSubmitted(true);
      return;
    }

    const result = await submitExam(exam.id, attemptId, answers);
    console.log("Submit result:", result);

    setSubmitResult({
      score: result.score,
      correctCount: result.correctCount,
    });
    setIsSubmitted(true);
  };

  // 查看结果
  const handleViewResult = () => {
    router.push(`/exams?tab=papers&result=${attemptId}`);
  };

  // 退出考试
  const handleQuitExam = () => {
    if (confirm("确定要退出吗？退出后将丢失答题进度")) {
      router.push("/exams");
    }
  };

  // 切换题目
  const goToPrevQuestion = () => setCurrentQuestion(Math.max(0, currentQuestion - 1));
  const goToNextQuestion = () => setCurrentQuestion(currentQuestion + 1);

  // 计算提交后的结果（备用逻辑）
  const getSubmitStats = () => {
    let correctCount = 0;
    let rawScore = 0;

    if (submitResult) {
      correctCount = submitResult.correctCount;
      rawScore = submitResult.score;
    } else {
      questions.forEach((q) => {
        const userAnswer = answers[q.id] || [];
        const correctAnswer = q.answer;
        if (checkAnswerEqual(userAnswer, correctAnswer, q)) {
          correctCount++;
          rawScore += q.score;
        }
      });
    }

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    return { correctCount, rawScore, scorePercent };
  };

  // 获取答案文本
  const getAnswerText = (question: QuestionBank & { score: number; sort_order: number }, answerId: string) => {
    const options = parseOptions(question.options) as { id: string; text: string }[] | null;
    if (!options) return answerId;
    const opt = options.find((o) => o.id === answerId || String(o.id) === answerId);
    if (opt) return opt.text;
    const strId = String(answerId).toUpperCase();
    const idx = strId.charCodeAt(0) - 65;
    if (idx >= 0 && idx < options.length) {
      return options[idx].text;
    }
    return answerId;
  };

  return {
    // 状态
    questions,
    currentQuestion,
    answers,
    timeLeft,
    isSubmitted,
    submitResult,
    attemptId,
    // 方法
    handleAnswer,
    isOptionSelected,
    handleSubmit,
    handleViewResult,
    handleQuitExam,
    goToPrevQuestion,
    goToNextQuestion,
    getSubmitStats,
    getAnswerText,
    // 辅助计算值
    isLastQuestion: currentQuestion === questions.length - 1,
    progressPercent: ((currentQuestion + 1) / questions.length) * 100,
  };
};