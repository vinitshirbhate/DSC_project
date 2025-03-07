import bcrypt from "bcryptjs";
import { Context } from "hono";
import { MemoryCache } from "../db/memory.cache";
import { getPrismaClient } from "../db/prisma";
import { registerSchema } from "../models/user.model";
import { generateToken } from "../utils/generateToken";
import { MapData, UserMapData } from "../utils/types";
import { RedisSingleton } from "../db/redis.cache";

export class UserController {
  static async postUser(c: Context) {
    try {
      const prisma = getPrismaClient(c.env.DATABASE_URL);
      const redisClient = RedisSingleton.getInstance(c);
      
      const body = await c.req.json();

      const isValid = registerSchema.safeParse(body);

      if (!isValid.success) throw new Error(isValid.error.message);

      const hash = await bcrypt.hash(isValid.data.password, 12);

      const { name, email } = isValid.data;

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hash,
        },
      });

      console.log(user)
      const { accessToken, refreshToken } = await generateToken(
        {
          id: user.id,
          email,
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        },
        c.env.JWT_SECRET
      );

      user.accessToken = accessToken;
      user.refreshToken = refreshToken;

      MemoryCache.setMemory(`access:${user.id}`, {
        expiry: Math.floor(Date.now() / 1000) + 60 * 60,
        data: {
          token: accessToken,
          meta: email,
        },
      } as MapData);

      await redisClient.set(`redis:${user.id}`, {
        expiry: Math.floor(Date.now() / 1000) + 60 * 60,
        data: {
          token: accessToken,
          meta: email,
        },
      });

      return c.json({
        message : "User registered!",
        token : accessToken,
        success : true
      })

    } catch (error) {
      return c.json({
        error: error instanceof Error ? error.message : String(error),
        message: "Something went wrong!",
        success : false
      }, 500);
    }
  }

  static async getUserById(c : Context) {
    try {
      const {id} = c.req.query();

      if(MemoryCache.getMemory(`user:${id}`)) {
        return c.json({
          message : "User found!",
          user : MemoryCache.getMemory(`user:${id}`),
          success : true
        }, 201)
      }

      // const redisClient = RedisSingleton.getInstance(c);

      const prisma = await getPrismaClient(c.env.DATABASE_URL)
      const user = await prisma.user.findUnique({
        where : {
          id
        }, 
        select : {
          id : true,
          name : true,
          email : true,
          refreshToken : true,
        }
      })

      if(!user) throw new Error("User not found!")

      let cache : UserMapData = {
        ...user,
        expiry : Math.floor(Date.now() / 1000) + 60 * 60
      } as UserMapData;

      MemoryCache.setMemory(`user:${id}`, cache)

      return c.json({
        message : "User found!",
        user,
        success : true
      }, 201)

    } catch (error) {
      return c.json({
        error: error instanceof Error ? error.message : String(error),
        message: "Something went wrong!",
        success : false
      },500);
    }
  }

  static async getUserByEmail(c : Context) {
    try {
      const email = c.req.param('email')

      if(MemoryCache.getMemory(`email:${email}`)) {
        return c.json({
          message : "User found!",
          user : MemoryCache.getMemory(`email:${email}`),
          success : true
        }, 201)
      }

      if(!email) throw new Error("No email provided!")

      const prisma = await getPrismaClient(c.env.DATABASE_URL)

      const user = await prisma.user.findFirst({
        where : {
          email
        }, 
        select : {
          id : true,
          name : true,
          email : true,
          refreshToken : true,
        }
      })

      let cache : UserMapData = {
        ...user,
        expiry : Math.floor(Date.now() / 1000) + 60 * 60
      } as UserMapData;

      MemoryCache.setMemory(`email:${email}`,cache)

      return c.json({
        message : "User found!",
        user,
        success : true
      }, 201)

    } catch (error) {
      return c.json({
        error: error instanceof Error ? error.message : String(error),
        message: "Something went wrong!",
        success : false
      },500);
    }
  }

  static async putUser(c : Context) {
    try {
      const {id} = c.req.query();
      const body = await c.req.json();

      const prisma = await getPrismaClient(c.env.DATABASE_URL)

      const user = await prisma.user.update({
        where : {
          id
        },
        data : {
          ...body
        }
      })

      return c.json({
        message : "User updated!",
        user,
        success : true
      }, 201)

    } catch (error) {
      return c.json({
        error: error instanceof Error ? error.message : String(error),
        message: "Something went wrong!",
        success : false
      },500);
    }
  }

  static async deleteUser(c : Context) {
    try {
      const {id} = c.req.query();

      const prisma = await getPrismaClient(c.env.DATABASE_URL)

      await prisma.user.delete({
        where : {
          id
        }
      })

      return c.json({
        message : "User deleted!",
        success : true
      }, 201)

    } catch (error) {
      return c.json({
        error: error instanceof Error ? error.message : String(error),
        message: "Something went wrong!",
        success : false
      },500);
    }
  }
}
