import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    create,
    findAll,
    createActivitySchema,
    activityQuerySchema,
    serialize,
    serializeList,
} from "@/modules/activity";

export async function GET(
    request: NextRequest
) {
    try {
        const searchParams =
            Object.fromEntries(
                request.nextUrl.searchParams
            );

        const query =
            activityQuerySchema.parse(
                searchParams
            );

        const [data, total] =
            await findAll(query);

        return NextResponse.json({
            success: true,

            data: serializeList(data),

            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(
                    total /
                        (query.limit ?? 20)
                ),
            },
        });
    } catch (error) {
        console.error(
            "Activities GET error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch activities",
            },
            {
                status: 500,
            }
        );
    }
}

export async function POST(
    request: NextRequest
) {
    try {
        const body =
            await request.json();

        const data =
            createActivitySchema.parse(
                body
            );

        const result =
            await create(data);

        return NextResponse.json(
            {
                success: true,
                data: serialize(result),
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "Activities POST error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to create activity",
            },
            {
                status: 400,
            }
        );
    }
}
