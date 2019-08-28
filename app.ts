import {fakeSyncOperation, fakeReadFileAsync, fakeSetInterval, fakeSetTimeout, fakeSetImmediate, fakeProcess_nextTick} from "./src/fakeOperations";
import Illustration from "./src/illustration";

/*
 * Тут с помощью метода add() класса Illustration можно добавлять операции, порядок выполнения которых в Event Loop нужно проиллюстрировать.
 * add() принимает в качестве аргумента саму операцию, а также timeArg.
 * Доступные операции: fakeSyncOperation, fakeReadFileAsync, fakeSetInterval, fakeSetTimeout, fakeSetImmediate, fakeProcess_nextTick;
 * Дополнительная информация:
 * timeArg (0 по умолчанию) позволяет: (1) для таймеров - установить время таймера; (2) для операций fakeReadFile и fakeSyncOperation задать минимальное время для их выполнения.
 * колбэк каждого из fakeSetInterval будет запущен не более 10 раз. Колбэки fakeSetInterval, произошедшие после начала иллюстрации, не учитываются в иллюстрации.
 * каждой выполненной операции присваевается имя и соотвутствующий номер (в порядке их появления в коде скрипта).
 */

// Примеры добавления операций
const illustration = new Illustration();

illustration.add(fakeReadFileAsync);
illustration.add(fakeReadFileAsync, 1000);
illustration.add(fakeSetTimeout, 0);
illustration.add(fakeSetInterval, 3000);
illustration.add(fakeSetImmediate);
illustration.add(fakeProcess_nextTick);
illustration.add(fakeSyncOperation, 1000);

// run() запускает иллюстрацию Event Loop с добавленными выше фейк-операциями (имитирует порядок выполнения реальных операций и дает пояснения)
illustration.run();
