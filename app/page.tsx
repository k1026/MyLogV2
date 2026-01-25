"use client";

import { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-4xl font-bold">カウンタ</h1>
      <div className="flex items-center space-y-0 space-x-4">
        <button
          onClick={() => setCount(count - 1)}
          className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
        >
          減少
        </button>
        <span className="text-3xl font-mono">{count}</span>
        <button
          onClick={() => setCount(count + 1)}
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          増加
        </button>
      </div>
    </div>
  );
}
