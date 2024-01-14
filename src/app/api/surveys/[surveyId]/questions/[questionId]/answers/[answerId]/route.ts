import routeHandler from "@/lib/routeHandler";
import prisma from "@/lib/prisma";
import Answer from "@/schemas/Answer";

export const GET = routeHandler(async (request, context) => {
  const { answerId } = context.params;
  const answers = await prisma.questionAnswer.findUniqueOrThrow({
    where: {
      id: answerId,
    },
  });
  return answers;
});

export const PATCH = routeHandler(async (request, context) => {
  const { answerId } = context.params;
  const body = await request.json();

  const validation = await Answer.safeParseAsync(body);

  if (!validation.success) {
    throw validation.error;
  }

  const { data } = validation;

  const updatedAnswer = await prisma.questionAnswer.update({
    where: {
      id: answerId,
    },
    data,
  });

  return updatedAnswer;
});

export const DELETE = routeHandler(async (request, context) => {
  const { answerId } = context.params;

  const response = await prisma.questionAnswer.delete({
    where: {
      id: answerId,
    },
  });

  return response;
});
