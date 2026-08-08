import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    findById,
    update,
    remove,
    updateActivitySchema,
    serialize,
} from "@/modules/activity";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } =
            await context.params;

        const data =
            await findById(id);

        if (!data) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Activity not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            data: serialize(data),
        });
    } catch (error) {
        console.error(
            "Activity GET error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch activity",
            },
            {
                status: 500,
            }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } =
            await context.params;

        const body =
            await request.json();

        const data =
            updateActivitySchema.parse(
                body
            );

        const result =
            await update(
                id,
                data
            );

        if (!result) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Activity not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            data: serialize(result),
        });
    } catch (error) {
        console.error(
            "Activity PATCH error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to update activity",
            },
            {
                status: 400,
            }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } =
            await context.params;

        const result =
            await remove(id);

        if (!result) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Activity not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Activity deleted successfully",
        });
    } catch (error) {
        console.error(
            "Activity DELETE error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to delete activity",
            },
            {
                status: 500,
            }
        );
    }
}
