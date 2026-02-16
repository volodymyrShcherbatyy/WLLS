import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token) {
          return false;
        }

        if (req.nextUrl.pathname.startsWith("/admin")) {
          return Boolean(token.isAdmin);
        }

        return true;
      }
    }
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/learn/:path*", "/test/:path*", "/library/:path*", "/admin/:path*"]
};
