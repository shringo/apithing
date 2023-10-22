import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";

type PostUser = RouterOutputs["post"]["getAll"][number];
export function PostView(props: PostUser) {
  const { post, author } = props;
  return (
    <div className="flex gap-3 p-4 border-b border-slate-400" key={post.id}>
      <Image src={author.avatar} className="w-12 h-12 rounded-full" alt={author.avatar + "'s profile picture"} width={56} height={56}/>
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1">
          <Link href={'/@' + author.username}>
            <span>{'@' + author.username}</span>
          </Link>
          <span className="font-light">•</span>
          <Link href={'/post/' + post.id}>
            <ProcessDate {...props}/>
          </Link>
        </div>
        <span className="text-l break-all whitespace-normal">{post.content}</span>
      </div>
    </div>
  );
}

function ProcessDate(post: PostUser) {
    const { createdAt } = post.post;
    const diff = Date.now() - createdAt.getTime();
    let msg = "";
  
    if(diff < 5 * 1000) msg = "Moments ago";
    else if(diff < 60 * 1000) msg = Math.round(diff / 1000) + " seconds ago";
    else if(diff < 60 * 60 * 1000) msg = Math.round(diff / 1000 / 60) + " minutes ago";
    else if(diff < 24 * 60 * 60 * 1000) msg = Math.round(diff / 1000 / 60 / 60) + " hours ago";
    else if(diff < 7 * 24 * 60 * 60 * 1000) msg = Math.round(diff / 1000 / 60 / 60 / 24) + " days ago";
    else if(diff < 30 * 7 * 24 * 60 * 60 * 1000) msg = Math.round(diff / 1000 / 60 / 60 / 24 / 7) + " weeks ago";
    else if(diff < 365 * 24 * 60 * 60 * 1000) msg = Math.round(diff / 1000 / 60 / 60 / 24 / 7 / 30) + " months ago";
    else msg = Math.round(diff / 1000 / 60 / 60 / 24 / 365) + " years ago";
  
    return (
      <span className="font-light">{msg.startsWith('1 ') ? msg.replace("s ago", " ago") : msg}</span>
    )
  }