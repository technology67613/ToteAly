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
        // Artificial delay to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, 500));

        const username = credentials?.username;
        const password = credentials?.password;
        const adminUser = process.env.ADMIN_USERNAME;
        const adminPass = process.env.ADMIN_PASSWORD;

        if (username !== adminUser) return null;

        // Check if stored password is a bcrypt hash
        const isHash = adminPass?.startsWith("$2");
        
        let isValid = false;
        if (isHash) {
          const bcrypt = await import("bcryptjs");
          isValid = await bcrypt.compare(password || "", adminPass || "");
        } else {
          // Plaintext fallback (Vulnerable - log warning)
          isValid = password === adminPass;
          if (isValid) {
             console.warn("⚠️ ADMIN_PASSWORD is stored in plaintext. Use bcrypt to hash it for production.");
          }
        }

        if (isValid) {
          return {
            id: "admin-id",
            name: "Admin",
            email: adminUser,
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
