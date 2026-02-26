export type UserRole = 'student' | 'teacher' | 'admin';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  teacher_id: string;
  category_id: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  teacher_name?: string;
  category_name?: string;
};

export type User = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  updated_at: string;
};

// 仅保留题目类型枚举（匹配数据库 type 字段的取值）
export type QuestionType = 
  | 'single_choice' 
  | 'multiple_choice' 
  | 'true_false' 
  | 'fill_blank' 
  | 'essay';
  
// 核心 Question 类型（匹配数据库表字段）
export type Question = {
  id: string;
  course_id: string | null;
  type: QuestionType;
  title: string;
  options: string[] | null;   // JSON 字符串，如 '["A","B","C","D"]'
  answer: string | null;    // 单选"B"，多选'["A","B"]'，是非"true"，填空/简答"xxx"
  score: number;
  created_at: string;
  updated_at: string;
};

// QuestionCard = Question + course_name（题库中使用的类型）
export type QuestionCard = Question & {
  course_name: string | null;
};

// 保持向后兼容
export type QuestionBank = QuestionCard;

export type Exam = {
  id: string;
  title: string;
  description: string | null;
  course_id: string | null;
  duration: number;
  total_score: number;
  shuffle_questions: boolean;
  question_count: number;
  start_time: string | null;
  end_time: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  course_name?: string;
  creator_name?: string;
};

export type ExamQuestion = {
  id: string;
  exam_id: string;
  question_id: string;
  score: number;
  sort_order: number;
  created_at: string;
  question?: QuestionBank;
};

export type ExamAttempt = {
  id: string;
  exam_id: string;
  user_id: string;
  start_time: string;
  submit_time: string | null;
  score: number | null;
  total_score: number;
  status: string;
  created_at: string;
  updated_at: string;
  exam?: Exam;
  user?: User;
};

export type PaperStatus = 'draft' | 'published';
export type ExamStatus = 'in_progress' | 'submitted' | 'graded';