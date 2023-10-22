import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import filterUser from "~/server/helpers/FilterUser";
import type { Post } from "@prisma/client";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, "1m"),
  analytics: true
})

const userDataToPost = async (posts: Post[]) => {
  const users = (await clerkClient.users.getUserList({
    userId: posts.map(map => map.author),
    limit: 100
  })).map(filterUser);
  return posts.map((post) => {
    const author = users.find(user => user.id === post.author);
    if(typeof author?.username !== "string") throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Author for post not found" });
    else return {
      post,
      author: {
        ...author,
        username: author.username
      }
    };
  });
}

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
    return userDataToPost(posts);
  }),
  getPostsByUser: publicProcedure.input(z.object({ userId: z.string() }))
  .query(({ ctx, input }) => ctx.db.post.findMany({
          where: {
              author: input.userId
          },
          orderBy: {
              createdAt: "desc"
          },
          take: 100
  }).then(userDataToPost))
});
