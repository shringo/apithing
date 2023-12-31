import { SignInButton, SignOutButton, useUser } from "@clerk/clerk-react";
import Image from "next/image";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";
import { LoadingPage, LoadingSpinner } from "~/components/loading";

import PageLayout from "~/components/layout";
import { api } from "~/utils/api";
import { PostView } from "~/components/postview";

function PostToast(props: { input: string, setInput: Dispatch<SetStateAction<string>>}) {
  const { input, setInput } = props;
  const { user } = useUser();
  const ctx = api.useUtils();
  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.post.getAll.invalidate();
    },
    onError: (e) => {
      const error = e.data?.zodError?.fieldErrors.content?.[0] ?? "Failed to post, try again later.";
      toast.error(error);
    },
  });
  if(!user) return null;

  return (
    <div className="flex gap-4 w-full">
      <Image src={user.imageUrl} className="w-12 h-12 rounded-full" alt={user.username + "'s profile picture"} width={56} height={56}/>
      <input 
        maxLength={255} 
        minLength={5} 
        placeholder="What is happening?" 
        className="bg-slate-900 rounded-3xl grow px-3"
        type="text"
        value={input}
        onKeyDown={(e) => {
          if(e.key === "Enter") {
            e.preventDefault();
            if(input.length) {
              mutate({ content: input });
            }
          }
        }}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && <button 
        className="bg-sky-600 rounded-3xl px-3"
        onClick={() => mutate({ content: input })}
        disabled={isPosting}
      >Tweet</button>}
      {isPosting && <div className="place-self-center"><LoadingSpinner size={25}/></div>}
    </div>
  )
}

export function Feed() {
  const { data, isLoading: postLoading } = api.post.getAll.useQuery();
  if(postLoading) return <LoadingPage/>;
  if(!data) return <div>No data available</div>;
  return (
    <div className="flex flex-col border-slate-400">
      {data.map((post) => (
        <PostView {...post} key={post.post.id}/>
      ))}
    </div>
  );
}

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const [ draftPost, setDraftPost ] = useState("");

  // cache the data
  api.post.getAll.useQuery();

  if(!userLoaded) return <div/>;

  return (
    <PageLayout>
      <div className="border-b border-t border-slate-400 p-4 flex gap-5">
        {
          isSignedIn ? 
          <PostToast input={draftPost} setInput={setDraftPost}></PostToast> : 
          <div className="flex justify-center">{isSignedIn ? <SignOutButton></SignOutButton> : <SignInButton></SignInButton>}</div>
        }
      </div>
      <Feed/>
    </PageLayout>
  );
}
