import { openai } from "@/lib/openai";
import { NextResponse } from "next/server";
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from "openai/resources/chat/index.mjs";

interface RequestType {
  topic: string;
}

export type Qna = {
  question: string;
  answer: string;
};

export type GPTResponse = {
  qna: Qna[];
};

export const POST = async (request: Request) => {
  // if (!request) return;

  const topic = ((await request.json()) as RequestType).topic;

  // return NextResponse.json({
  //   omak: "kos",
  // });

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You generate questions about given topics using the functions you have been provided with. Only use the functions you have been provided with.",
    },
    {
      role: "user",
      content: `Create five questions.\nTopic: ${topic}`,
    },
  ];

  const functions: ChatCompletionCreateParams.Function[] = [
    {
      name: "getQuestions",
      description:
        "This function generates questions for students. It accepts an array of objects. Each object should include a question and an answer to the question.",
      parameters: {
        type: "object",
        properties: {
          qna: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: {
                  type: "string",
                },
                answer: {
                  type: "string",
                },
              },
              required: ["question", "answer"],
            },
          },
        },
        required: ["qna"],
      },
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    functions: functions,
    function_call: "auto", // auto is default, but we'll be explicit
  });

  const responseMessage = response.choices[0].message;
  if (!responseMessage.function_call) throw new Error("Invalid output by ai.");

  const functionArguments = JSON.parse(
    responseMessage.function_call.arguments
  ) as GPTResponse;

  return NextResponse.json({
    qna: functionArguments.qna,
  });
};
