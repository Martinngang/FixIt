import { projectId } from "../../utils/supabase/info.ts";

export const CATEGORIES = ['Road', 'Drainage', 'Electricity'];
export const STATUSES = ['Received', 'In Progress', 'Fixed'];
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `https://${projectId}.supabase.co/functions/v1`;