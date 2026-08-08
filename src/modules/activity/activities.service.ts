import * as repository from "./activities.repository";

import type {
    CreateActivityInput,
    UpdateActivityInput,
    ActivityQuery,
} from "./types";

export async function create(
    data: CreateActivityInput
) {
    return repository.create(data);
}

export async function findAll(
    query: ActivityQuery = {}
) {
    return repository.findAll(query);
}

export async function findById(
    id: string
) {
    return repository.findById(id);
}

export async function update(
    id: string,
    data: UpdateActivityInput
) {
    return repository.update(
        id,
        data
    );
}

export async function remove(
    id: string
) {
    return repository.remove(id);
}
