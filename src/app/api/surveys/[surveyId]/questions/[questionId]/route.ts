import { NextRequest, NextResponse } from "next/server";
import routeHandler from "@/lib/routeHandler";
import prisma from "@/lib/prisma";
import Question from "@/schemas/Question";

export const DELETE = routeHandler(async (request, context) => {
  const { surveyId, questionId } = context.params;

  const questionToDelete = await prisma.question.findUniqueOrThrow({
    where: {
      id: questionId,
    },
    include: {
      survey: true,
    },
  });

  if (!questionToDelete.survey || questionToDelete.survey.id !== surveyId) {
    return NextResponse.json(
      {
        error: "Question does not belong to the specified survey.",
      },
      { status: 404 }
    );
  }

  await prisma.question.delete({
    where: {
      id: questionId,
    },
  });

  const { position, survey } = questionToDelete;

  const remainingQuestions = await prisma.question.findMany({
    where: {
      surveyId,
      position: { gt: position },
    },
    orderBy: {
      position: "asc",
    },
  });

  for (const remainingQuestion of remainingQuestions) {
    await prisma.question.update({
      where: {
        id: remainingQuestion.id,
      },
      data: {
        position: remainingQuestion.position - 1,
      },
    });
  }

  const updatedSurvey = await prisma.survey.findUnique({
    where: {
      id: surveyId,
    },
    include: {
      questions: true,
    },
  });

  return NextResponse.json(updatedSurvey);
});

export const PATCH = routeHandler(async (request, context) => {
  const { questionId } = context.params;
  const body = await request.json();

  const validation = await Question.safeParseAsync(body);

  if (!validation.success) {
    throw validation.error;
  }

  const question = await prisma.question.findUniqueOrThrow({
    where: {
      id: questionId,
    },
  });

  const { data } = validation;

  if (
    data.position !== undefined &&
    data.position !== question.position &&
    data.position >= 0
  ) {
    const { position, ...updateData } = data;
    const [start, end] =
      data.position > question.position
        ? [question.position + 1, data.position]
        : [data.position, question.position - 1];

    await prisma.question.updateMany({
      where: {
        id: { not: questionId },
        position: { gte: start, lte: end },
      },
      data: {
        position:
          data.position > question.position
            ? { decrement: 1 }
            : { increment: 1 },
      },
    });

    const updatedPositions = await prisma.question.updateMany({
      where: {
        id: { not: questionId },
      },
      data: updateData,
    });
  }
  const updatedQuestion = await prisma.question.update({
    where: {
      id: questionId,
    },
    data,
  });
  return updatedQuestion;
});
