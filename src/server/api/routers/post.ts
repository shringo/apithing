import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const filterData = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    avatar: user.imageUrl
  }
}

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, "1m"),
  analytics: true
})

export const postRouter = createTRPCRouter({
  create: privateProcedure.input(z.object({
    content: z.string().min(5).max(255)
  })).mutation(async ({ ctx, input }) => {
    const author = ctx.userId;

    const { success } = await ratelimit.limit(author);
    if(!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

    const post = await ctx.db.post.create({
      data: {
        author,
        content: input.content
      }
    });
    return post;
  }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: [
        {
          createdAt: "desc"
        }
      ]
    });
    const users = (await clerkClient.users.getUserList({
      userId: posts.map(map => map.author),
      limit: 100
    })).map(filterData);
    return posts.map((post) => {
      const author = users.find(user => user.id === post.author);
      if(!author || author.username === null) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Author for post not found" });
      else return {
        post,
        author: {
          ...author,
          username: author.username
        }
      };
    });
  }),
});
