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

export type QuestionType = 'single_choice' | 'multi_choice' | 'fill_blank' | 'short_answer' | 'essay';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionBank = {
  id: string;
  course_id: string | null;
  type: string;
  title: string;
  options: { id: string; text: string }[] | null;
  answer: { id: string }[] | string | null;
  score: number;
  created_at: string;
  updated_at: string;
  course_name?: string;
};

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

export type Question = {
  id: string;
  course_id: string | null;
  type: QuestionType;
  content: string;
  options: string[] | null;
  answer: string | string[];
  explanation: string | null;
  difficulty: Difficulty;
  score: number;
  sort_order: number;
  created_at: string;
};
