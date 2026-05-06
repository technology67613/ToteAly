"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed.");
      }

      setStatus("success");
      setMessage(data.message || "You are on the list.");
      setEmail("");
    } catch (error: unknown) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not save your signup.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email"
          required
          className="min-w-0 flex-1 bg-[#F5ECD7]/30 border border-[#F5ECD7] px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-[#FF69B4]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-[#900C3F] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#FF69B4] transition-all disabled:opacity-60"
        >
          {status === "loading" ? "..." : "Join"}
        </button>
      </div>
      {message && (
        <p className={`text-xs ${status === "error" ? "text-red-600" : "text-[#900C3F]/60"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
