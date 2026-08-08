import {
    ActivityModel,
} from "@/models/activity.model";

import type {
    CreateActivityInput,
    UpdateActivityInput,
    ActivityQuery,
} from "./types";

export async function create(
    data: CreateActivityInput
) {
    return ActivityModel.create(data);
}

export async function findAll(
    query: ActivityQuery = {}
) {
    const page = query.page ?? 1;

    const limit = query.limit ?? 20;

    const skip =
        (page - 1) * limit;

    const filter: Record<
        string,
        unknown
    > = {};

    return Promise.all([
        ActivityModel
            .find(filter)
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        ActivityModel
            .countDocuments(filter),
    ]);
}

export async function findById(
    id: string
) {
    return ActivityModel
        .findById(id)
        .lean();
}

export async function update(
    id: string,
    data: UpdateActivityInput
) {
    return ActivityModel
        .findByIdAndUpdate(
            id,
            data,
            {
                new: true,
                runValidators: true,
            }
        )
        .lean();
}

export async function remove(
    id: string
) {
    return ActivityModel
        .findByIdAndDelete(id)
        .lean();
}
