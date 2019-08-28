/*
 * fakeOperations
 * имитирует выполнение основных операций readFile(async), setTimeout, setInterval, синхронных операций, setImmediate(), process.nextTick()
 * После выполнения каждая операция возвращает объект с именем операции и информацией о ее выполении.
 */
import {readFile} from "fs";
import {OperationResult, OperationCallback, FakeOperation} from "./types";
const maxIntervals: number = 10;
let readFileN: number = 0,
    timeoutN: number = 0,
    intervalN: number = 0,
    syncOperationN: number = 0,
    setImmediateN: number = 0,
    processNextTickN: number = 0;

const readFileHandle = (fileReadingTime: number) : Promise<string> => {
    return new Promise(resolve => {
        if (fileReadingTime === 0) {
            readFile("file.txt", "utf8", (error, content: string) => {
                if (error) throw error;
                return resolve(content);
            });
        }

        setTimeout(() => {
            readFile("file.txt", "utf8", (error, content: string) => {
                if (error) throw error;
                return resolve(content);
            });
        }, fileReadingTime);
    });
};

export const fakeReadFileAsync: FakeOperation = async (setTime: number, callback: OperationCallback, fileReadingTime: number) => {
    const number: number = ++readFileN;

    const fileContent: string = await readFileHandle(fileReadingTime);
    const processTime: number = fileReadingTime + 14; // файл-пример file.txt читается примерно за 14ms
    const result: OperationResult = {
        type: "readFile",
        name: `readFile №${number}`,
        setTime,
        processTime,
        doneTime: Date.now(),
        description: `Чтение файла происходит в стадии poll EventLoop после проверки наличия завершенных таймеров.
            Если этот процесс выполнен, значит файл прочитан. Содержание файла: "${fileContent}"\n`
    };
    return callback(result);
};

export const fakeSyncOperation: FakeOperation = (setTime, callback: OperationCallback, processTime) => {
    const number: number = ++syncOperationN;

    const startProcess: number = Date.now();
    while (Date.now() - startProcess < processTime) {
        // do nothing
    }
    const result: OperationResult = {
        type: "syncOperation",
        name: `syncOperation №${number}`,
        setTime,
        processTime,
        doneTime: Date.now(),
        description: `Синхронные операции являются блокирующими и выполняются до начала Event Loop в обычном порядке (в порядке их появления в коде скрипта).
            Таймеры, process.nextTick(), setImmediate() и другие Async операции выполняются только после Sync операций скрипта.
        `
    };
    return callback(result);
};

export const fakeSetTimeout: FakeOperation = (setTime, callback: OperationCallback, timerTime) => {
    const number: number = ++timeoutN;

    setTimeout(() => {
        const result: OperationResult = {
            type: "timer",
            name: `setTimeout №${number}`,
            setTime,
            timerTime,
            doneTime: Date.now(),
            description: `Таймеры выполняются после Sync операций скрипта в 1-й фазе Event Loop.
            Таймеры выполняются, когда время таймера подошло к концу (время течет во время выполнения Sync или Async кода).
            Если время таймера еще не пришло, то он выполняется позже (после опустошения очереди poll).
            Между каждым проходом Event Loop проверяет, есть ли в очереди еще таймеры или async I/O (если нет, Event Loop заканчивает работу).
            `
        };
        return callback(result);
    }, timerTime);
};

export const fakeSetInterval: FakeOperation = (setTime, callback: OperationCallback, timerTime) => {
    const number: number = ++intervalN;

    let intervalsRan: number = 0;
    const interval = setInterval(() => {
        intervalsRan++;
        if (intervalsRan >= maxIntervals) clearInterval(interval);
        const result: OperationResult = {
            type: "timer",
            name: `setInterval №${number}`,
            setTime,
            timerTime,
            doneTime: Date.now(),
            description: `Интервал выполняются после Sync операций скрипта в 1-й фазе Event Loop.
            Если интервал выполнился, значит, прошел определенный пользователем промежуток времени (время отсчитывается в ходе выполения Sync или Async кода).
            `
        };
        return callback(result);
    }, timerTime);
};

export const fakeSetImmediate: FakeOperation = (setTime, callback: OperationCallback) => {
    const number: number = ++setImmediateN;

    setImmediate(() => {
        const result: OperationResult = {
            type: "setImmediate",
            name: `setImmediate №${number}`,
            setTime,
            doneTime: Date.now(),
            description: `SetImmediate выполняется в фазе check в случае, если очередь poll пуста / если текущая фаза poll завершилась.
            Если бы setImmediate операции отсутствовали, то Event Loop находился бы в стадии poll и ожидал новые колбэки.
            Приоритет выполнения setImmediate в сравнении с setTimeout (при наличии) зависит от контектса их вызова. 
            В нашем случае вызов происходит из основного модуля, поэтому порядок не предопределен (зависит от performance процесса).
            Если бы вызов происходил в рамках цикла I/O, то первым бы всегда выполнялся setImmediate.
            `
        };
        return callback(result);
    });
};

export const fakeProcess_nextTick: FakeOperation = (setTime, callback: OperationCallback) => {
    const number: number = ++processNextTickN;

    process.nextTick(() => {
        const result: OperationResult = {
            type: "process.nextTick",
            name: `process.nextTick() №${number}`,
            setTime,
            doneTime: Date.now(),
            description: `process.nextTick() не является частью Event Loop (он приостанавливает Event Loop, выполняет свой колбэк, а затем возобновляет Event Loop).
            Колбэк process.nextTick() выполняется сразу после выполнения текущего процесса Event Loop (независимо от фазы Event Loop).
            Только после его выполнения Event Loop может продолжить работу.
            process.nextTick() выполняется раньше setImmediate (так как process.nextTick() выполняется в любой фазе Event Loop, а setImmediate выполняется на следующей итерации Event Loop в фазе check.
            `
        };
        return callback(result);
    });
};


