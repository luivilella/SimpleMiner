/* Defines the miner entity */

export interface IMenuMiner {
    id: number;
    name: string;
    slug: string;
}

export interface IMenuCategory {
    id: number;
    name: string;
    slug: string;
    categories?: IMenuCategory[];
    miners?: IMenuMiner[];
}

export interface IMenu {
    categories?: IMenuCategory[];
}