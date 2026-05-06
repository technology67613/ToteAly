/**
 * Database connection utility.
 * Currently disabled (Mock Mode) as per user request.
 * Plan: Integrate Supabase here.
 */
export default async function connectDB() {
  // No-op for mock mode.
  return Promise.resolve(true);
}
