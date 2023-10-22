import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import filterUser from "~/server/helpers/FilterUser";

export const profileRouter = createTRPCRouter({
    getProfileByname: publicProcedure.input(z.object({ username: z.string() }))
        .query(async ({ input }) => {
            const [user] = await clerkClient.users.getUserList({
                username: [input.username]
            });

            if(!user) throw new TRPCError({ code:"NOT_FOUND", message: "User not found." });

            return filterUser(user);
        })
});