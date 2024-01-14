import routeHandler from "@/lib/routeHandler";
import prisma from "@/lib/prisma";
import Answer from "@/schemas/Answer";

export const POST = routeHandler(async (request, context) => {
    const {questionId} = context.params

    const body = await request.json()

    const validation =  await Answer.safeParseAsync(body);

    if(!validation.success){
        throw validation.error;
    }

    const {data} = validation

    const answer = await prisma.questionAnswer.create({
        data: {
            answer: data.answer,
            questionId: questionId,
        },
    })

    const updatedQuestion = await prisma.question.findUnique({
        where: {
            id: questionId
        },
        include: {
            answers: true,
        },
    })

    return updatedQuestion
})

export const GET = routeHandler(async (request, context) => {
    const {questionId} = context.params
    const answers = await prisma.questionAnswer.findMany({
        where: {
            questionId: questionId
        }
    })

    return answers
})