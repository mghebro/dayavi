"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { UnauthorizedError } from "@/lib/permissions";

export async function markNotificationReadAction(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: session.user.id,
    },
    data: { read: true },
  });

  revalidatePath("/app");
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      read: false,
    },
    data: { read: true },
  });

  revalidatePath("/app");
  return { success: true };
}
