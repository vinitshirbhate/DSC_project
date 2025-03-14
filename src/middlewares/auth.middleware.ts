import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { getPrismaClient } from "../db/prisma";

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const prisma = getPrismaClient(c.env.DATABASE_URL);
    const header = c.req.header("Authorization");
    if (!header)
      return c.json(
        { message: "No authorization header", success: false },
        401
      );

    const token = header.split(" ")[1];
    if (!token)
      return c.json({ message: "Token missing", success: false }, 401);

    const revoked = await prisma.blacklist.findFirst({
      where: { token },
    });

    if(revoked) throw new Error("Token is revoked!")

    if (!c.env.ACCESS_SECRET)
      return c.json({ message: "Missing secret key", success: false }, 500);

    const decoded = await verify(token, c.env.ACCESS_SECRET);
    if (!decoded)
      return c.json(
        { message: "Invalid or malformed JWT!", success: false },
        403
      );

    const data = {
      token: token,
      ...decoded,
    };

    c.set("jwtPayload", data);
    await next();
  } catch (error) {
    return c.json(
      {
        message: error instanceof Error ? error.message : "Unauthorized",
        success: false,
      },
      403
    );
  }
};
