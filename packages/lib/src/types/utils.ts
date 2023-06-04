export type MethodsOfClass<T> = {
	[K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
};

export type Unpromisify<T> = {
	[K in keyof T]: T[K] extends (...args: any[]) => Promise<infer U> ? (...args: Parameters<T[K]>) => U : T[K];
};
