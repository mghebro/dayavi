import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { ProjectSettingsForm } from "@/components/projects/ProjectSettingsForm";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { workspaceSlug, projectSlug } = await params;

  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      workspace: {
        slug: workspaceSlug,
        members: { some: { userId: session.user.id } },
      },
    },
    include: {
      workspace: true,
    },
  });

  if (!project) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ProjectSettingsForm
        project={{
          id: project.id,
          name: project.name,
          slug: project.slug,
          description: project.description,
          status: project.status,
          accentColor: project.accentColor,
        }}
        workspaceSlug={workspaceSlug}
      />
    </div>
  );
}
