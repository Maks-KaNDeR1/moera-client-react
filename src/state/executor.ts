import { call, select, takeEvery } from 'typed-redux-saga/macro';

import getContext from "state/context";
import { ClientAction, ClientActionType } from "state/action";
import { WithContext } from "state/action-types";

type PayloadExtractor<T> = (payload: T) => string;

type PayloadToKey = PayloadExtractor<any> | string | null;

export type ExecutorSaga<T extends ClientAction> = (action: WithContext<T>) => any;

export interface Executor {
    action: ClientActionType;
    payloadToKey: PayloadToKey;
    saga: ExecutorSaga<any>;
}

export interface ExecutorState {
    payloadToKey: PayloadToKey;
    saga: ExecutorSaga<any>;
    running: Set<string>;
}

export type ExecutorMap = Map<ClientActionType, ExecutorState>;

export function executor<T extends ClientAction>(
    action: T["type"], payloadToKey: string | null, saga: ExecutorSaga<T>): Executor;
export function executor<T extends ClientAction & {payload: any}>(
    action: T["type"], payloadToKey: PayloadExtractor<T["payload"]> | string | null, saga: ExecutorSaga<T>): Executor;
export function executor(action: ClientActionType, payloadToKey: PayloadToKey,
                         saga: ExecutorSaga<any>): Executor {
    return {action, payloadToKey, saga};
}

function addExecutor(executors: ExecutorMap, executor: Executor): void {
    const {action, payloadToKey, saga} = executor;

    executors.set(action, {
        payloadToKey,
        saga,
        running: new Set()
    })
}

export function collectExecutors(...lists: Executor[] | Executor[][]): ExecutorMap {
    const executors: ExecutorMap = new Map();
    for (const list of lists) {
        if (Array.isArray(list)) {
            for (const executor of list) {
                addExecutor(executors, executor);
            }
        } else {
            addExecutor(executors, list);
        }
    }
    return executors;
}

function* executorsSaga(executors: ExecutorMap, action: WithContext<ClientAction>) {
    const signal = action.type;
    const executor = executors.get(signal);
    if (executor === undefined) {
        return;
    }

    let key = null;
    if (executor.payloadToKey != null) {
        if (typeof(executor.payloadToKey) === "function") {
            if ("payload" in action) {
                key = executor.payloadToKey(action.payload);
            } else {
                console.error("Action executor requires payload, but action does not have one", action);
            }
        } else {
            key = executor.payloadToKey;
        }
        if (key != null) {
            if (executor.running.has(key)) {
                return;
            }
            executor.running.add(key);
        }
    }
    action.context = yield* select(getContext);
    try {
        yield* call(executor.saga, action);
    } catch (e) {
        console.error("Error running saga for action", action);
        console.error(e);
    }
    if (key != null) {
        executor.running.delete(key);
    }
}

export function* invokeExecutors(executors: ExecutorMap) {
    yield* takeEvery([...executors.keys()], executorsSaga, executors);
}