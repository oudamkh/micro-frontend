export declare const formatDate: (date: Date | string) => string;
export declare const truncateText: (text: string, maxLength: number) => string;
export declare const debounce: <T extends (...args: any[]) => void>(func: T, wait: number) => T;
