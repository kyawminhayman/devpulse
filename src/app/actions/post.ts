"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createPost(data: { title: string; content: string; imageUrl?: string }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl,
      authorId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/blog");
  
  return post;
}

export async function updatePost(id: string, data: { title: string; content: string; imageUrl?: string }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) throw new Error("Not found");

  if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/blog");
  revalidatePath(`/blog/${id}`);

  return updated;
}

export async function deletePost(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) throw new Error("Not found");

  if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  await prisma.post.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/blog");
}
