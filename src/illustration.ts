/*
 * Class Illustration
 * 1) добавляет в массив объекты-результаты выполнения операций в ходе Event Loop
 * 2) иллюстрирует(имитирует) ход Event Loop используя созданный массив результатов операций
 */
import {OperationResult, FakeOperation, OperationCallback} from "./types";

export default class Illustration {
    private readonly operations: OperationResult[] = [];
    private readonly minWaitTime: number = 10000;
    private waitTimeCount: number = 0;

    constructor() {
        this.operations = [];
        this.waitTimeCount = 0;
    }

    add(operation: FakeOperation, timeArg: number = 0): void {
        const setTime: number = Date.now();
        const storeCallback: OperationCallback = this.storeResult.bind(this);
        this.waitTimeCount += timeArg;
        operation(setTime, storeCallback, timeArg);
    }

    private storeResult(result: OperationResult): void {
        this.operations.push(result);
    }

    private sort(operations: OperationResult[]): OperationResult[] {
        function compare(a: OperationResult, b: OperationResult): number {
            const doneTimeA: number = a.doneTime;
            const doneTimeB: number = b.doneTime;

            let comparison: number = 0;
            if (doneTimeA > doneTimeB) {
                comparison = 1;
            } else if (doneTimeA < doneTimeB) {
                comparison = -1;
            }
            return comparison;
        }

        return operations.slice().sort(compare);
    }

    private static pause(pauseTime: number = 1000): void {
        const startPause: number = Date.now();
        while (Date.now() - startPause < pauseTime) {
            // do nothing
        }
    }

    private static getLogMessages(operation: OperationResult): { phase: string, description: string } {
        let phaseMessage: string,
            processTimeMessage: string;

        switch (operation.type) {
            case 'timer':
                phaseMessage = "\nЕсть завершенные таймеры. Event Loop в фазе Timers\n";
                processTimeMessage = `\nУстановленный таймер/интервал: ${operation.timerTime}ms`;
                break;
            case 'readFile':
                phaseMessage = "\nEvent Loop в фазе poll.\n";
                processTimeMessage = `\nВремя чтения файла: ${operation.processTime}ms`;
                break;
            case 'setImmediate':
                phaseMessage = "\nEvent Loop в фазе check. Выполнение очереди SetImmediate\n";
                processTimeMessage = "";
                break;
            case 'process.nextTick':
                phaseMessage = "\nEvent Loop прерван обработкой process.nextTick().\n";
                processTimeMessage = "";
                break;
            default:
                phaseMessage = "\nВыполнение синхронного кода. Event Loop пока не начат.\n";
                processTimeMessage = operation.processTime === 0 ? "" : `\nУстановленное пользователем минимальное время выполнения процесса: ${operation.processTime}ms`;
        }

        const descriptionMessage = `Выполнено: ${operation.name}` + processTimeMessage + `\nОперация выполнена через ${operation.doneTime - operation.setTime}ms после ее появления в коде.\nПочему так?
            ${operation.description}\n`;

        return {phase: phaseMessage, description: descriptionMessage};
    }

    run(): void {
        const timeTillStart: number = Math.max(this.minWaitTime, this.waitTimeCount);
        console.log(`\nИллюстрация кода начнется через ${Math.ceil(timeTillStart / 1000)} сек. ...\n\nОперации будут появляться в порядке их запуска Event Loop'ом с пояснениями`);

        setTimeout(() : void => {
            if (this.operations.length == 0) return console.log(`\nИллюстрация не запущена: не было добавлено ни одной фейк-операции.\nИспользуйте метод add() класса Illustration для добавления операций в стэк / Event Loop. Затем запустите иллюстрацию с помощью метода run().\n\nПример: 
                const illustration = new Illustration();
                illustration.add(fakeSetTimeout, 1000);
                illustration.run();\n`);

            const operations: ReadonlyArray<OperationResult> = this.sort(this.operations);

            console.log("\n---\nОПЕРАЦИИ В ПОРЯДКЕ ИХ ВЫПОЛНЕНИЯ:\n---\n");
            Illustration.pause();
            
            for (let operation of operations) {
                const logMessages = Illustration.getLogMessages(operation);
                console.log(logMessages.phase);
                Illustration.pause();
                console.log(logMessages.description);
                Illustration.pause(3000);
            }
            console.log("\nEvent Loop проверяет, есть ли в очереди еще таймеры или async I/O.\n");
            Illustration.pause();
            console.log("Операций в очереди больше нет, Event Loop завершил работу.\n");
        }, timeTillStart);
    };
}

