import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      nativeLanguageId?: string | null;
      targetLanguageId?: string | null;
      nativeLanguageCode?: string | null;
      targetLanguageCode?: string | null;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    isAdmin: boolean;
    nativeLanguageId?: string | null;
    targetLanguageId?: string | null;
    nativeLanguageCode?: string | null;
    targetLanguageCode?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
    nativeLanguageId?: string | null;
    targetLanguageId?: string | null;
    nativeLanguageCode?: string | null;
    targetLanguageCode?: string | null;
  }
}
