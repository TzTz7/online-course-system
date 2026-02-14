# 在线教育平台数据库设计

## 概述

本项目是一个在线教育平台，包含课程学习、在线考试、直播课堂、AI辅导、聊天室等功能。以下是完整的数据库表结构设计。

---

## 表总览

| 序号 | 表名 | 模块 | 说明 |
|------|------|------|------|
| 1 | users | 用户系统 | 用户账户信息 |
| 2 | categories | 课程分类 | 课程分类目录 |
| 3 | courses | 课程系统 | 课程基本信息 |
| 4 | chapters | 课程系统 | 课程章节 |
| 5 | enrollments | 课程系统 | 学生选课记录 |
| 6 | chapter_progress | 课程系统 | 章节学习进度 |
| 7 | exam_papers | 考试系统 | 试卷 |
| 8 | questions | 考试系统 | 题目题库 |
| 9 | paper_questions | 考试系统 | 试卷题目关联 |
| 10 | exam_attempts | 考试系统 | 考试记录 |
| 11 | materials | 教材资料 | 课程资料下载 |
| 12 | live_classes | 直播课堂 | 直播课程安排 |
| 13 | class_recordings | 直播课堂 | 课堂录像 |
| 14 | channels | 聊天室 | 聊天频道 |
| 15 | chat_messages | 聊天室 | 聊天消息 |
| 16 | ai_roles | AI角色 | AI角色定义 |
| 17 | ai_conversations | AI角色 | AI对话会话 |
| 18 | ai_messages | AI角色 | AI聊天消息 |
| 19 | announcements | 通知公告 | 系统公告 |
| 20 | user_announcements | 通知公告 | 用户公告阅读状态 |

---

## 详细表说明

### 1. users - 用户表

**作用**: 存储平台所有用户的基本信息

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，用户唯一标识 |
| email | VARCHAR(255) | 邮箱，登录账号，唯一 |
| password_hash | VARCHAR(255) | 密码哈希值 |
| name | VARCHAR(100) | 用户姓名 |
| avatar | VARCHAR(500) | 头像URL |
| role | ENUM | 角色: student(学生)/teacher(教师)/admin(管理员) |
| status | ENUM | 账户状态: active/inactive/banned |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**关系**:
- 教师创建课程 (courses.teacher_id)
- 教师发起直播 (live_classes.teacher_id)
- 用户选课 (enrollments.user_id)
- 用户考试 (exam_attempts.user_id)
- 用户发消息 (chat_messages.user_id, ai_conversations.user_id)

---

### 2. categories - 课程分类表

**作用**: 课程分类目录，便于按类别浏览课程

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 分类名称，如"计算机科学"、"数学" |
| slug | VARCHAR(100) | URL友好标识 |
| description | TEXT | 分类描述 |
| icon | VARCHAR(50) | 图标名称 |
| sort_order | INT | 排序权重 |

---

### 3. courses - 课程表

**作用**: 存储课程的基本信息

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| title | VARCHAR(200) | 课程名称 |
| slug | VARCHAR(200) | URL友好标识 |
| description | TEXT | 课程描述 |
| teacher_id | UUID | 授课教师，外键→users |
| category_id | UUID | 分类，外键→categories |
| cover_image | VARCHAR(500) | 封面图片URL |
| hours | INT | 课时数 |
| chapters_count | INT | 章节总数 |
| tags | JSON | 标签，如["必修", "核心"] |
| difficulty | ENUM | 难度: easy/medium/hard |
| is_published | BOOLEAN | 是否发布 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

---

### 4. chapters - 章节表

**作用**: 课程章节结构，支持课程目录展示和学习进度跟踪

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| course_id | UUID | 所属课程，外键→courses |
| title | VARCHAR(200) | 章节标题 |
| description | TEXT | 章节描述 |
| sort_order | INT | 章节顺序 |
| is_published | BOOLEAN | 是否发布 |

---

### 5. enrollments - 选课表

**作用**: 记录学生的选课情况和整体学习进度

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 学生，外键→users |
| course_id | UUID | 课程，外键→courses |
| progress | INT | 学习进度百分比(0-100) |
| status | ENUM | 状态: enrolled(学习中)/completed(已完成)/dropped(已放弃) |
| enrolled_at | TIMESTAMP | 报名时间 |
| completed_at | TIMESTAMP | 完成时间 |
| last_accessed | TIMESTAMP | 最后访问时间 |

**唯一约束**: (user_id, course_id) - 每个学生每门课只有一条记录

---

### 6. chapter_progress - 章节进度表

**作用**: 记录学生对每个章节的完成情况

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 学生，外键→users |
| chapter_id | UUID | 章节，外键→chapters |
| is_completed | BOOLEAN | 是否完成 |
| completed_at | TIMESTAMP | 完成时间 |

**唯一约束**: (user_id, chapter_id)

---

### 7. exam_papers - 试卷表

**作用**: 存储试卷信息，包括考试时间、时长、难度等

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| title | VARCHAR(200) | 试卷名称 |
| course_id | UUID | 对应课程，外键→courses |
| description | TEXT | 试卷描述 |
| time_limit | INT | 时长(分钟) |
| total_score | INT | 总分 |
| passing_score | INT | 及格分数 |
| difficulty | ENUM | 难度 |
| status | ENUM | 状态: draft(草稿)/published(已发布) |
| scheduled_at | TIMESTAMP | 计划考试时间 |

---

### 8. questions - 题目表

**作用**: 题库，存储各类题目及答案

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| course_id | UUID | 所属课程，外键→courses |
| type | ENUM | 题目类型 |
| content | TEXT | 题目内容 |
| options | JSON | 选项(选择题用) |
| answer | JSON | 正确答案 |
| explanation | TEXT | 题目解析 |
| difficulty | ENUM | 难度 |
| score | INT | 分值 |
| sort_order | INT | 排序 |

**题目类型**:
- single_choice: 单选题
- multi_choice: 多选题
- fill_blank: 填空题
- short_answer: 简答题
- essay: 论述题

---

### 9. paper_questions - 试卷题目关联表

**作用**: 将题目组合成试卷，记录题目在试卷中的顺序和分值

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| paper_id | UUID | 试卷，外键→exam_papers |
| question_id | UUID | 题目，外键→questions |
| sort_order | INT | 题目顺序 |
| score | INT | 该题分值(可覆盖题目默认分值) |

**唯一约束**: (paper_id, question_id)

---

### 10. exam_attempts - 考试记录表

**作用**: 记录学生的考试参与情况和成绩

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 学生，外键→users |
| paper_id | UUID | 试卷，外键→exam_papers |
| score | INT | 最终得分 |
| status | ENUM | 考试状态 |
| started_at | TIMESTAMP | 开始时间 |
| submitted_at | TIMESTAMP | 提交时间 |
| graded_at | TIMESTAMP | 判卷时间 |
| answers | JSON | 答案记录 {"question_id": "answer"} |

**状态说明**:
- in_progress: 考试中
- submitted: 已提交
- graded: 已判卷

---

### 11. materials - 教材资料表

**作用**: 存储课程相关的下载资料

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| course_id | UUID | 所属课程，外键→courses |
| chapter_id | UUID | 所属章节(可选)，外键→chapters |
| title | VARCHAR(200) | 资料名称 |
| type | ENUM | 文件类型 |
| file_url | VARCHAR(500) | 文件URL |
| file_size | BIGINT | 文件大小(字节) |
| downloads | INT | 下载次数 |
| view_count | INT | 浏览次数 |
| uploaded_by | UUID | 上传人，外键→users |

---

### 12. live_classes - 直播课堂表

**作用**: 管理直播课程安排

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| course_id | UUID | 关联课程，外键→courses |
| teacher_id | UUID | 主讲教师，外键→users |
| title | VARCHAR(200) | 课堂标题 |
| description | TEXT | 课堂描述 |
| scheduled_at | TIMESTAMP | 计划开始时间 |
| started_at | TIMESTAMP | 实际开始时间 |
| ended_at | TIMESTAMP | 结束时间 |
| status | ENUM | 状态 |
| meeting_url | VARCHAR(500) | 会议链接 |
| max_participants | INT | 最大参与人数 |

**状态说明**:
- scheduled: 已安排
- live: 直播中
- ended: 已结束
- cancelled: 已取消

---

### 13. class_recordings - 课堂录像表

**作用**: 存储直播课程的录像回放

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| live_class_id | UUID | 直播课程，外键→live_classes |
| title | VARCHAR(200) | 录像标题 |
| duration | INT | 视频时长(秒) |
| video_url | VARCHAR(500) | 视频URL |
| view_count | INT | 观看次数 |

---

### 14. channels - 聊天室频道表

**作用**: 创建和管理聊天频道

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 频道名称 |
| description | TEXT | 频道描述 |
| type | ENUM | 频道类型: public(公开)/private(私有) |
| created_by | UUID | 创建者，外键→users |

---

### 15. chat_messages - 聊天消息表

**作用**: 存储聊天消息记录

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| channel_id | UUID | 所属频道，外键→channels |
| user_id | UUID | 发送者，外键→users |
| content | TEXT | 消息内容 |
| created_at | TIMESTAMP | 发送时间 |

**索引优化**:
- 按频道查询消息
- 按用户查询消息
- 按时间排序

---

### 16. ai_roles - AI角色表

**作用**: 定义不同的AI角色及其配置

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 角色名称 |
| slug | VARCHAR(100) | 角色标识 |
| subtitle | VARCHAR(200) | 副标题 |
| description | TEXT | 角色描述 |
| system_prompt | TEXT | 系统提示词 |
| greeting | TEXT | 欢迎语 |
| icon | VARCHAR(50) | 图标 |
| color | VARCHAR(20) | 主题色 |
| is_active | BOOLEAN | 是否启用 |
| sort_order | INT | 排序 |

---

### 17. ai_conversations - AI对话表

**作用**: 记录用户与AI的对话会话

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户，外键→users |
| role_id | UUID | AI角色，外键→ai_roles |
| created_at | TIMESTAMP | 会话开始时间 |
| updated_at | TIMESTAMP | 最后消息时间 |

---

### 18. ai_messages - AI消息表

**作用**: 存储AI对话的具体消息

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| conversation_id | UUID | 对话会话，外键→ai_conversations |
| role | ENUM | 发送者: user/assistant |
| content | TEXT | 消息内容 |
| created_at | TIMESTAMP | 发送时间 |

---

### 19. announcements - 通知公告表

**作用**: 发布系统公告和通知

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| title | VARCHAR(200) | 公告标题 |
| content | TEXT | 公告内容 |
| type | ENUM | 公告类型 |
| priority | ENUM | 优先级 |
| target_all | BOOLEAN | 是否全员可见 |
| published_by | UUID | 发布人，外键→users |
| published_at | TIMESTAMP | 发布时间 |
| expires_at | TIMESTAMP | 过期时间 |

**类型说明**:
- exam: 考试通知
- homework: 作业通知
- notice: 一般通知
- live: 直播通知

---

### 20. user_announcements - 用户公告表

**作用**: 跟踪用户对公告的阅读状态

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户，外键→users |
| announcement_id | UUID | 公告，外键→announcements |
| is_read | BOOLEAN | 是否已读 |
| read_at | TIMESTAMP | 阅读时间 |

**唯一约束**: (user_id, announcement_id)

---

## 视图

### 1. user_learning_stats - 用户学习统计视图

汇总用户的学习数据:
- 报名课程数
- 已完成课程数
- 参加考试次数
- 平均考试成绩

### 2. course_stats - 课程统计视图

汇总课程的运营数据:
- 报名人数
- 完成人数
- 平均学习进度
- 考试参与次数

---

## ER图关系

```
┌─────────────┐     ┌─────────────┐
│    users    │────<│   courses   │
└─────────────┘     └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        v                  v                  v
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   chapters    │  │  enrollments  │  │ exam_papers   │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                   │                   │
        v                   v                   v
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│chapter_progress│  │  exam_attempts│  │   questions   │
└───────────────┘  └───────────────┘  └───────┬───────┘
                                               │
                                        ┌──────┴──────┐
                                        │paper_questions
                                        └─────────────┘
```

---

## 使用说明

1. **PostgreSQL**: 直接运行 `create_tables.sql`
2. **MySQL**: 需要将 UUID 类型改为 VARCHAR(36)，gen_random_uuid() 改为 UUID()
3. **SQLite**: 需要调整部分语法

---

## 更新日志

- 2026-02-15: 初始版本，包含20张表
