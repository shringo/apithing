import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterData = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    avatar: user.imageUrl
  }
}

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100
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
