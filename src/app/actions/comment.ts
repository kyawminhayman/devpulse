"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function addComment(postId: string, content: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      userId: session.user.id,
    },
    include: { user: true },
  });

  return comment;
}

export async function deleteComment(commentId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { post: true } });

  if (!comment) throw new Error("Not found");

  if (comment.userId !== session.user.id && session.user.role !== "ADMIN" && comment.post.authorId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await prisma.comment.delete({ where: { id: commentId } });
  
  return { success: true };
}

export async function getComments(postId: string) {
  return await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });
}
