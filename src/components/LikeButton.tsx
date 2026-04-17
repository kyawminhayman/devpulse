"use client";

import { useState } from "react";
import { toggleLike } from "@/app/actions/like";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  initiallyLiked: boolean;
}

export default function LikeButton({ postId, initialLikes, initiallyLiked }: LikeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initiallyLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    
    if (loading) return;
    setLoading(true);

    try {
      const res = await toggleLike(postId);
      setLiked(res.liked);
      setLikesCount((prev) => (res.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Like failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center space-x-1 ${liked ? "text-red-500" : "text-slate-400"} hover:text-red-400 transition-colors`}
    >
      <Heart className={liked ? "fill-current" : ""} size={20} />
      <span>{likesCount}</span>
    </button>
  );
}
