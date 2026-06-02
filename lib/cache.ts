import { Course } from "@/types/course";
import { Product } from "@/types/product";

export const globalCourseCache: Record<string, Course> = {};

export const globalProductCache: Record<string, Product> = {};
