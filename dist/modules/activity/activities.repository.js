import { ActivityModel, } from "@/models/activity.model";
export async function create(data) {
    return ActivityModel.create(data);
}
export async function findAll(query = {}) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const filter = {};
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
export async function findById(id) {
    return ActivityModel
        .findById(id)
        .lean();
}
export async function update(id, data) {
    return ActivityModel
        .findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    })
        .lean();
}
export async function remove(id) {
    return ActivityModel
        .findByIdAndDelete(id)
        .lean();
}
//# sourceMappingURL=activities.repository.js.map