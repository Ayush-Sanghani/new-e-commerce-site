import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { updateProfileBodySchema } from "@/lib/validations/profile";

function emptyToNull(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Sign in required.", data: null },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            phone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found.", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile fetched successfully.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
        profile: user.profile,
      },
    });
  } catch (err) {
    console.error("GET /api/me:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile.", data: null },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Sign in required.", data: null },
      { status: 401 }
    );
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = updateProfileBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed.",
        error: parsed.error.flatten().fieldErrors,
        data: null,
      },
      { status: 400 }
    );
  }

  if (parsed.data.email !== undefined && parsed.data.email !== sessionUser.email) {
    return NextResponse.json(
      {
        success: false,
        message: "Email update is not supported in this version.",
        data: null,
      },
      { status: 400 }
    );
  }

  const profileData = {
    phone: emptyToNull(parsed.data.phone),
    addressLine1: emptyToNull(parsed.data.addressLine1),
    addressLine2: emptyToNull(parsed.data.addressLine2),
    city: emptyToNull(parsed.data.city),
    state: emptyToNull(parsed.data.state),
    postalCode: emptyToNull(parsed.data.postalCode),
    country: emptyToNull(parsed.data.country),
  };

  try {
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        name: parsed.data.name !== undefined ? parsed.data.name : undefined,
        profile: {
          upsert: {
            create: profileData,
            update: profileData,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const updatedProfile = await prisma.userProfile.findUnique({
      where: { userId: sessionUser.id },
      select: {
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found after update.", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt,
        },
        profile: updatedProfile,
      },
    });
  } catch (err) {
    console.error("PATCH /api/me:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update profile.", data: null },
      { status: 500 }
    );
  }
}
