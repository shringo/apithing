import type { User } from "@clerk/nextjs/dist/types/server";

const filterUser = (user: User) => {
    return {
      id: user.id,
      username: user.username,
      avatar: user.imageUrl
    };
}

export default filterUser;