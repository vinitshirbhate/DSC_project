import { sign } from "hono/jwt";
import { signData } from "./types";

export const generateToken = async (data: signData, secret: string, refreshSecret: string) => {

  const accessData = { ...data, exp: Math.floor(Date.now() / 1000) + 60 * 60}; 
  const refreshData = { ...data, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }; 

  const accessToken = await sign(accessData, secret);
  const refreshToken = await sign(refreshData, refreshSecret);

  return { accessToken, refreshToken };
};
