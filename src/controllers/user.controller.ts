import bcrypt from "bcryptjs";
import { Context } from "hono";
import { MemoryCache } from "../db/memory.cache";
import { getPrismaClient } from "../db/prisma";
import { loginSchema, registerSchema } from "../models/user.model";
import { generateToken } from "../utils/generateToken";
import { MapData, UserMapData } from "../utils/types";
import { RedisSingleton } from "../db/redis.cache";
import { createId } from "@paralleldrive/cuid2";

export class UserController {
  static async postUser(c: Context) {
    try {
      const prisma = getPrismaClient(c.env.DATABASE_URL);
      const redisClient = RedisSingleton.getInstance(c);

      const body = await c.req.json();
      const isValid = registerSchema.safeParse(body);

      if (!isValid.success) {
        return c.json(
          {
            error: isValid.error.message,
            message: "Invalid input data",
            success: false,
          },
          400
        );
      }

      const existingUser = await prisma.user.findFirst({
        where: { email: isValid.data.email },
      });

      if (existingUser) {
        return c.json(
          {
            error: "Email already in use",
            message: "Email already registered",
            success: false,
          },
          409
        );
      }

      const hash = await bcrypt.hash(isValid.data.password, 12);
      const { name, email } = isValid.data;
      const userId = createId();

      const { accessToken, refreshToken } = await generateToken(
        {
          id: userId,
          email,
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        },
        c.env.ACCESS_SECRET,
        c.env.REFRESH_SECRET
      );

      console.log("Control Reached!");

      const user = await prisma.user.create({
        data: {
          id: userId,
          name,
          email,
          password: hash,
          accessToken,
          refreshToken,
        },
      });

      const cacheData = {
        expiry: Math.floor(Date.now() / 1000) + 60 * 60,
        data: {
          token: accessToken,
          meta: email,
        },
      } as MapData;

      MemoryCache.setMemory(`access:${user.id}`, cacheData);
      await redisClient.set(`access:${user.id}`, cacheData);
      await redisClient.expire(`access:${user.id}`, 60 * 60);

      return c.json(
        {
          message: "User registered!",
          token: accessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            refreshToken
          },
          success: true,
        },
        201
      );
    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : String(error),
          message: "Something went wrong!",
          success: false,
        },
        500
      );
    }
  }

  static async getUserById(c: Context) {
    try {
      const { id } = c.req.query();

      if (!id) {
        return c.json(
          {
            error: "Missing ID parameter",
            message: "User ID is required",
            success: false,
          },
          400
        );
      }

      const cacheKey = `user:${id}`;
      const redisClient = RedisSingleton.getInstance(c);

      const memoryCache = MemoryCache.getMemory(cacheKey);
      if (memoryCache) {
        return c.json(
          {
            message: "User found!",
            user: memoryCache,
            success: true,
          },
          200
        );
      }

      const redisCache = await redisClient.get(cacheKey);
      if (redisCache) {
        return c.json(
          {
            message: "User found!",
            user: redisCache,
            success: true,
          },
          200
        );
      }

      const prisma = await getPrismaClient(c.env.DATABASE_URL);
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          refreshToken: true,
        },
      });

      if (!user) {
        return c.json(
          {
            error: "User not found",
            message: "User with the provided ID does not exist",
            success: false,
          },
          404
        );
      }

      const cache: UserMapData = {
        ...user,
        expiry: Math.floor(Date.now() / 1000) + 60 * 60,
      } as UserMapData;

      MemoryCache.setMemory(cacheKey, cache);
      await redisClient.set(cacheKey, cache);
      await redisClient.expire(cacheKey, RedisSingleton.getTtl());

      return c.json(
        {
          message: "User found!",
          user,
          success: true,
        },
        200
      );

    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : String(error),
          message: "Something went wrong!",
          success: false,
        },
        500
      );
    }
  }

  static async getUserByEmail(c: Context) {
    try {
      const email = c.req.param("email");

      if (!email) {
        return c.json(
          {
            error: "Missing email parameter",
            message: "Email is required",
            success: false,
          },
          400
        );
      }

      const cacheKey = `email:${email}`;

      const memoryCache = MemoryCache.getMemory(cacheKey);
      if (memoryCache) {
        return c.json(
          {
            message: "User found!",
            user: memoryCache,
            success: true,
          },
          200
        );
      }

      const redisClient = RedisSingleton.getInstance(c);
      const redisCache = await redisClient.get(cacheKey);

      if (redisCache) {
        return c.json(
          {
            message: "User found!",
            user: redisCache,
            success: true,
          },
          200
        );
      }

      const prisma = await getPrismaClient(c.env.DATABASE_URL);
      const user = await prisma.user.findFirst({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          refreshToken: true,
        },
      });

      if (!user) {
        return c.json(
          {
            error: "User not found",
            message: "User with the provided email does not exist",
            success: false,
          },
          404
        );
      }

      const cache: UserMapData = {
        ...user,
        expiry: Math.floor(Date.now() / 1000) + 60 * 60,
      } as UserMapData;

      MemoryCache.setMemory(cacheKey, cache);
      await redisClient.set(cacheKey, cache);
      await redisClient.expire(cacheKey, RedisSingleton.getTtl());

      return c.json(
        {
          message: "User found!",
          user,
          success: true,
        },
        200
      );
    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : String(error),
          message: "Something went wrong!",
          success: false,
        },
        500
      );
    }
  }

  static async putUser(c: Context) {
    try {
      const { id } = c.req.query();

      if (!id) {
        return c.json(
          {
            error: "Missing ID parameter",
            message: "User ID is required",
            success: false,
          },
          400
        );
      }

      const body = await c.req.json();

      if (Object.keys(body).length === 0) {
        return c.json(
          {
            error: "Empty request body",
            message: "No data provided for update",
            success: false,
          },
          400
        );
      }

      const allowedFields = ["name", "email"];
      const filteredBody = Object.fromEntries(
        Object.entries(body).filter(([key]) => allowedFields.includes(key))
      );

      const prisma = await getPrismaClient(c.env.DATABASE_URL);

      if (filteredBody.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: filteredBody.email,
            id: { not: id },
          },
        });

        if (existingUser) {
          return c.json(
            {
              error: "Email already in use",
              message: "Email already registered by another user",
              success: false,
            },
            409
          );
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: filteredBody,
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      const redisClient = RedisSingleton.getInstance(c);

      MemoryCache.delete(`user:${id}`);
      MemoryCache.delete(`email:${user.email}`);

      await redisClient.del(`user:${id}`);
      await redisClient.del(`email:${user.email}`);

      return c.json(
        {
          message: "User updated!",
          user,
          success: true,
        },
        200
      );

    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Record to update not found")
      ) {
        return c.json(
          {
            error: "User not found",
            message: "User with the provided ID does not exist",
            success: false,
          },
          404
        );
      }

      return c.json(
        {
          error: error instanceof Error ? error.message : String(error),
          message: "Something went wrong!",
          success: false,
        },
        500
      );
    }
  }

  static async deleteUser(c: Context) {
    try {
      const { id } = c.req.query();

      if (!id) {
        return c.json(
          {
            error: "Missing ID parameter",
            message: "User ID is required",
            success: false,
          },
          400
        );
      }

      const prisma = await getPrismaClient(c.env.DATABASE_URL);

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return c.json(
          {
            error: "User not found",
            message: "User with the provided ID does not exist",
            success: false,
          },
          404
        );
      }

      await prisma.user.delete({
        where: { id },
      });

      const redisClient = RedisSingleton.getInstance(c);

      MemoryCache.delete(`user:${id}`);
      MemoryCache.delete(`email:${user.email}`);
      MemoryCache.delete(`access:${id}`);

      await redisClient.del(`user:${id}`);
      await redisClient.del(`email:${user.email}`);
      await redisClient.del(`access:${id}`);

      return c.json(
        {
          message: "User deleted!",
          success: true,
        },
        200
      );

    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : String(error),
          message: "Something went wrong!",
          success: false,
        },
        500
      );
    }
  }

  static async login(c: Context) {
    try {
      const prisma = getPrismaClient(c.env.DATABASE_URL);
      const redisClient = RedisSingleton.getInstance(c);

      const body = await c.req.json();
      const isValid = loginSchema.safeParse(body);

      console.log(isValid.data);

      if (!isValid.success) {
        return c.json(
          {
            error: isValid.error.message,
            message: "Invalid input data",
            success: false,
          },
          400
        );
      }

      const { email, password } = isValid.data;

      const user = await prisma.user.findFirst({
        where: { email },
      });

      if (!user) {
        return c.json(
          {
            error: "Invalid credentials",
            message: "Invalid email or password",
            success: false,
          },
          401
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return c.json(
          {
            error: "Invalid credentials",
            message: "Invalid email or password",
            success: false,
          },
          401
        );
      }

      const { accessToken, refreshToken } = await generateToken(
        {
          id: user.id,
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        },
        c.env.ACCESS_SECRET,
        c.env.REFRESH_SECRET
      );

      await prisma.user.update({
        where: { id: user.id },
        data: {
          accessToken,
          refreshToken,
        },
      });

      const cacheData = {
        expiry: Math.floor(Date.now() / 1000) + 60 * 60,
        data: {
          token: accessToken,
          meta: email,
        },
      } as MapData;

      MemoryCache.setMemory(`access:${user.id}`, cacheData);
      await redisClient.set(`access:${user.id}`, cacheData);
      await redisClient.expire(`access:${user.id}`, 60 * 60);

      return c.json(
        {
          message: "Login successful!",
          token: accessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          success: true,
        },
        200
      );
    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : String(error),
          message: "Something went wrong!",
          success: false,
        },
        500
      );
    }
  }

  static async me(c : Context) {
    try {
      const payload = c.get("jwtPayload");

      if(!payload) throw new Error("Unauthorized")

      return c.json({
        message : "Authorized",
        success : true,
        payload
      },200)

    } catch (error) {
      return c.json({
        error: error instanceof Error ? error.message : String(error),
        message: "Something went wrong!",
        success: false
      }, 500);
    }
  }

  static async logout(c: Context) {
    try {
      const payload = c.get("jwtPayload");
      if (!payload || !payload.id) {
        return c.json(
          {
            error: "Unauthorized",
            message: "User not logged in",
            success: false,
          },
          401
        );
      }
      
      const userId = payload.id;
      const prisma = await getPrismaClient(c.env.DATABASE_URL);
      const redisClient = RedisSingleton.getInstance(c);
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          accessToken: "",
          refreshToken: "",
        },
      });
      
      MemoryCache.delete(`access:${userId}`);
      await redisClient.del(`access:${userId}`);
      
      return c.json(
        {
          message: "Logout successful!",
          success: true,
        },
        200
      );
    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : String(error),
          message: "Something went wrong during logout!",
          success: false,
        },
        500
      );
    }
  }

  static async refresh(c: Context) {
    try {
      const prisma = getPrismaClient(c.env.DATABASE_URL);
      const redisClient = RedisSingleton.getInstance(c);

      const refreshToken = c.req.query('token');

      if (!refreshToken) {
        return c.json(
          {
            error: "Missing refresh token",
            message: "Refresh token is required",
            success: false,
          },
          400
        );
      }

      const user = await prisma.user.findFirst({
        where: { refreshToken },
      });

      if (!user) {
        return c.json(
          {
            error: "Invalid refresh token",
            message: "Refresh token is invalid or expired",
            success: false,
          },
          401
        );
      }

      const exp = Math.floor(Date.now() / 1000) + 60 * 60; 
      const { accessToken, refreshToken: newRefreshToken } = await generateToken(
        {
          id: user.id,
          email: user.email,
          exp,
        },
        c.env.ACCESS_SECRET,
        c.env.REFRESH_SECRET
      );

      await prisma.user.update({
        where: { id: user.id },
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      });

      const cacheData = {
        expiry: exp,
        data: {
          token: accessToken,
          meta: user.email,
        },
      } as MapData;

      MemoryCache.setMemory(`access:${user.id}`, cacheData);
      await redisClient.set(`access:${user.id}`, cacheData);
      await redisClient.expire(`access:${user.id}`, 60 * 60);

      return c.json(
        {
          message: "Token refreshed successfully!",
          token: accessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            refreshToken: newRefreshToken,
          },
          success: true,
        },
        200
      );
    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : String(error),
          message: "Something went wrong during token refresh!",
          success: false,
        },
        500
      );
    }
  }
}
