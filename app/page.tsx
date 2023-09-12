"use client";
import { openai } from "@/lib/openai";
import Image from "next/image";
import OpenAI from "openai";
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from "openai/resources/chat/index.mjs";
import { useState } from "react";

type Qna = {
  question: string;
  answer: string;
};

type GPTResponse = {
  qna: Qna[];
};

export default function Home() {
  const [data, setData] = useState<Qna[]>([]);
  const [topic, setTopic] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function run() {
    try {
      if (!topic || topic === "") return;

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

      setLoading(true);

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        functions: functions,
        function_call: "auto", // auto is default, but we'll be explicit
      });

      const responseMessage = response.choices[0].message;
      if (!responseMessage.function_call)
        throw new Error("Invalid output by ai.");

      const functionArguments = JSON.parse(
        responseMessage.function_call.arguments
      ) as GPTResponse;

      // console.log(functionArguments.qna);
      setData(functionArguments.qna);

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="p-8">
      <div className="flex flex-col">
        <label>Topic</label>
        <input
          onChange={(e) => setTopic(e.target.value)}
          className="border rounded-md w-48 p-2"
        />
      </div>
      <button onClick={run} className="border p-2 border-black">
        run
      </button>

      {loading ? (
        "loading..."
      ) : (
        <div className="flex flex-col mt-8 gap-4">
          {data.map(({ question, answer }, index) => {
            return (
              <div key={index} className="border rounded-md p-3 space-y-1">
                <p>Question: {question}</p>
                <p>Answer: {answer}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
