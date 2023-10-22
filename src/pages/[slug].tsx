import Head from "next/head";
import toast from "react-hot-toast";
import { api } from "~/utils/api";

const AVATAR_SIZE = 128; 

const ProfilePage: NextPage<{username:string}> = ({ username }) => {
  const { data } = api.profile.getProfileByname.useQuery({ username: "test" });
  if(!data) { 
    toast.error("User not found.");
    return;
  }
  return (
    <>
      <Head>
        <title>{'@' + data.username + "'s feed"}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image 
            src={data.avatar} 
            alt={data.username + "'s avatar"}
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            className={"-mb-[" + (AVATAR_SIZE / 2) + "px] absolute bottom-0 left-0 ml-4 rounded-full border-4 border-black"}
          />
        </div>
        <div className={"h-[" + (AVATAR_SIZE / 2) + "px]"}/>
        <div className="p-4 text-2xl font-bold">{'@' + data.username}</div>
        <div className="border-b border-slate-400"></div>
      </PageLayout>
    </>
  );
}

import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import type { GetStaticProps, NextPage } from "next";
import { TRPCError } from "@trpc/server";
import PageLayout from "~/components/layout";
import Image from "next/image";

// make sure this is get and NOT use or else usage of node.js packages that the browser doesn't know like "fs" will cause errors.
export const getStaticProps:GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson
  });

  const slug = context.params?.slug;
  if(typeof slug !== "string") throw new TRPCError({ code: "NOT_FOUND" });
  const username = slug.replace("@", "");
  await ssg.profile.getProfileByname.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username
    }
  };
}

export const getStaticPaths = () => {
  return {paths: [], fallback: "blocking"};
}

export default ProfilePage;