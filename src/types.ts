export interface OperationResult {
    readonly type: string;
    readonly setTime: number;
    readonly doneTime: number;
    readonly name: string;
    readonly description: string;
    readonly processTime?: number;
    readonly timerTime?: number;
}

export interface FakeOperation {
    (setTime: number, callback: OperationCallback, timeArg: number): void;
}

export interface OperationCallback {
    (result: OperationResult): void;
}