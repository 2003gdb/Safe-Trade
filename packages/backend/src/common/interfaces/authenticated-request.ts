
import { Request } from "express";

export interface UserProfile {
    id: number;
    email: string;
    name: string;
}

export interface AdminProfile {
    id: number;
    email: string;
    isAdmin: boolean;
}

export interface AccessPayload {
    sub: string;
    type: "access" | "admin";
    profile: UserProfile | AdminProfile;
}

export interface AuthenticatedUser {
    userId: string;
    profile: UserProfile | AdminProfile;
    raw: AccessPayload;
}

export interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}