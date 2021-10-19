import { IsNotEmpty, Min } from 'class-validator';

export interface CategoryType {
    categoryId: number;
    name: string;
    color: string;
    isActive: Boolean;
}

export class Category {
    @IsNotEmpty()
    @Min(0)
    categoryId: number;

    @IsNotEmpty()
    name: string;
    color: string;
    isActive: Boolean;

    constructor(
        categoryId: number,
        name: string,
        color: string,
        isActive: Boolean
    ) {
        this.categoryId = categoryId;
        this.name = name;
        this.color = color;
        this.isActive = isActive;
    }
}