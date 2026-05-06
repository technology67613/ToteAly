import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured } from "@/lib/supabase";
import { v5 as uuidv5 } from "uuid";

const TOTEALY_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (
          credentials?.username === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: "admin-id",
            name: "Admin",
            email: process.env.ADMIN_USERNAME,
            role: "admin",
          };
        }
        return null;
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (!user.email) return false;

      try {
        if (isSupabaseAdminConfigured()) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();

          const deterministicId = uuidv5(user.id || user.email, TOTEALY_NAMESPACE);

          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: existingProfile?.id || deterministicId,
              email: user.email,
              name: user.name,
              avatar_url: user.image,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'email' });

          if (error) {
            console.error("Supabase Sync Error during Sign In:", error);
          }
        }
        return true;
      } catch (err) {
        console.error("Auth Sign-In Error:", err);
        return true;
      }
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role || "user";

        if (token.email && isSupabaseAdminConfigured()) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('email', token.email)
            .single();

          if (profile) {
            (session.user as any).id = profile.id;
            (session.user as any).role = profile.role || "user";
          }
        }
        
        if (token.email === process.env.ADMIN_USERNAME) {
           (session.user as any).role = "admin";
        }
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = (user as any).role || "user";
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
