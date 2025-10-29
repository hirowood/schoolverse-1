export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/classroom",
    "/gallery",
    "/park",
    "/notes",
    "/video/:path*",
    "/3d",
    "/(virtual-space)/:path*",
  ],
};

