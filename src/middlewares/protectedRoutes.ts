// import { Context } from "hono";
// import { Jwt } from "hono/utils/jwt";

// export const protectedRoutes = () => {
//   return async (c: Context, next: () => Promise<void>) => {
//     const token = c.req.header.get("Authorization");
//     if (!token) {
//       return c.json({ message: "No token provided" }, 401);
//     }
//     try {
//       const decoded = await verifyToken(token);
//       c.user = decoded;
//       await next();
//     } catch (error) {
//       return c.json({ message: "Invalid token" }, 401);
//     }
//   };
// };

// async function verifyToken(token: string) {
//   const decoded = await Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//   return decoded;
// }
