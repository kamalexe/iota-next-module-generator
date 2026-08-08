import type { CreateActivityInput, UpdateActivityInput, ActivityQuery } from "./types";
export declare function create(data: CreateActivityInput): Promise<any>;
export declare function findAll(query?: ActivityQuery): Promise<any>;
export declare function findById(id: string): Promise<any>;
export declare function update(id: string, data: UpdateActivityInput): Promise<any>;
export declare function remove(id: string): Promise<any>;
