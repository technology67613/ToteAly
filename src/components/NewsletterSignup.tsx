"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'You\'re in! Welcome to the iconic club. 🎉');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (e) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
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
          disabled={status === 'loading'}
          className="bg-[#900C3F] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#FF69B4] transition-all disabled:opacity-60"
        >
          {status === 'loading' ? '...' : 'JOIN'}
        </button>
      </div>
      {status === 'success' && <p className="text-green-600 text-sm mt-2">{message}</p>}
      {status === 'error' && <p className="text-red-600 text-sm mt-2">{message}</p>}
    </form>
  );
}
