"use server";

import prisma from "@/lib/db/prisma";

export async function verifyEmailToken(token: string) {
  if (!token) {
    return { success: false, error: "Missing verification token." };
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return { success: false, error: "Verification link is invalid or has expired." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: { token },
    }),
  ]);

  return { success: true, message: "Email verified successfully! You may now sign in." };
}
