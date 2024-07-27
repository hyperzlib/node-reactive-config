export type TestConfig = {
    list: number[];
    str_list: number[];
    map: Record<string, number>;
};

export type TestSetMapConfig = {
    list: Set<number>;
    str_list: Set<number>;
    map: Map<string, number>;
};