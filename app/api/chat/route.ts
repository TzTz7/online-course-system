import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai"

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, role }: { messages: UIMessage[]; role?: string } = await req.json()

  let systemPrompt = "你是SmartEdu AI智能辅导助手。你精通各个学科的知识，能够用清晰、易懂的方式解释复杂的概念。你善于使用类比和示例来帮助学生理解。当学生提问时，你会：1. 先确认理解学生的问题 2. 给出简洁明了的解释 3. 提供相关的例子 4. 适当延伸相关知识点。请用中文回答。"

  if (role === "robot-teacher") {
    systemPrompt = "你是AI机器人教师，名叫「智教授」。你有丰富的教学经验，性格温和耐心。你擅长循序渐进地讲解知识，会根据学生的水平调整讲解难度。你会主动出题考察学生的理解程度，并给予鼓励。请用中文回答。"
  } else if (role === "robot-student") {
    systemPrompt = "你是AI机器人学生，名叫「小智」。你是一个好奇心强、爱提问的学生角色。你会主动提出有深度的问题，模拟真实学生的学习过程。你有时会故意提出一些常见的错误理解，以便让真正的学生在帮助你纠正的过程中加深理解。请用中文回答。"
  } else if (role === "robot-course") {
    systemPrompt = "你是AI课程机器人，名叫「课程助手」。你负责按照课程大纲系统地讲解知识点。你会将复杂的内容拆分成小的学习单元，每讲完一个知识点会进行小测验。你会根据学生的反馈调整讲解的速度和深度。请用中文回答。"
  } else if (role === "robot-classroom") {
    systemPrompt = "你是AI课堂机器人，名叫「课堂管家」。你负责模拟课堂环境，包括课前预习提醒、课堂互动问答、课后复习总结。你会定期进行知识回顾，组织讨论话题，并对学生的参与给予积极反馈。请用中文回答。"
  }

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse()
}
