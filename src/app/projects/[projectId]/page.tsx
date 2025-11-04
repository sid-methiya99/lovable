interface ProjectIdProps {
  params: Promise<{ projectId: string }>;
}
export default async function ProjectId({ params }: ProjectIdProps) {
  const { projectId } = await params;
  return <div>ProjectId: {projectId}</div>;
}
