export function serialize(data) {
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
export function serializeList(data) {
    return data.map(serialize);
}
//# sourceMappingURL=serializer.js.map