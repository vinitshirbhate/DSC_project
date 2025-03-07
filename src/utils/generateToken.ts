import { sign } from "hono/jwt";
import { signData } from "./types";

export const generateToken = async (data: signData, secret: string) => {
  const accessToken = await sign(data, secret);

  data.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;

  const refreshToken = await sign(data, secret);

  return { accessToken, refreshToken };
};
