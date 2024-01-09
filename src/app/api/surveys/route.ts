import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import SurveySchema from "@/schemas/Survey";
import { ZodError } from "zod";

export async function GET() {
  const surveys = await prisma.survey.findMany({});

  return NextResponse.json({
    data: surveys,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = await SurveySchema.safeParseAsync(body);

    if (!validation.success) {
      throw validation.error;
    }

    const { data } = validation;

    const survey = await prisma.survey.create({
      data,
    });

    return NextResponse.json({
      data: survey,
    });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        {
          errors: e.errors,
        },
        {
          status: 400,
        }
      );
    }
    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
