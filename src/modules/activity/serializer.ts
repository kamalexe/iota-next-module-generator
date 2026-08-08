export function serialize(
    data: any
) {
    if (!data) {
        return null;
    }

    const result = {
        ...data,
        id: data._id?.toString(),
    };

    delete result._id;
    delete result.__v;

    return result;
}

export function serializeList(
    data: any[]
) {
    return data.map(serialize);
}
