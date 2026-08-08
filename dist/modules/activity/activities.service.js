import * as repository from "./activities.repository";
export async function create(data) {
    return repository.create(data);
}
export async function findAll(query = {}) {
    return repository.findAll(query);
}
export async function findById(id) {
    return repository.findById(id);
}
export async function update(id, data) {
    return repository.update(id, data);
}
export async function remove(id) {
    return repository.remove(id);
}
//# sourceMappingURL=activities.service.js.map