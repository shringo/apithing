import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

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
            {dayjs(post.createdAt).fromNow()}
          </Link>
        </div>
        <span className="text-l break-all whitespace-normal">{post.content}</span>
      </div>
    </div>
  );
}