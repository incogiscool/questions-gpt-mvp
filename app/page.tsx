"use client";
import { openai } from "@/lib/openai";
import axios from "axios";
import Image from "next/image";
import OpenAI from "openai";
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from "openai/resources/chat/index.mjs";
import { useState } from "react";
import { Qna } from "./api/create-question/route";

export default function Home() {
  const [data, setData] = useState<Qna[]>([]);
  const [topic, setTopic] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function run() {
    try {
      if (!topic || topic === "") return;

      setLoading(true);

      const res = await axios.post<{ qna: Qna[] }>("/api/create-question", {
        topic: "omak",
      });
      console.log(res);

      // console.log(functionArguments.qna);
      setData(res.data.qna);

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
      <button onClick={run} className="border p-2 border-black mt-2 rounded">
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
