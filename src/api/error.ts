function extractMessage(messageOrError: any): string {
    if (messageOrError instanceof DOMException && messageOrError.name === "AbortError") {
        return "Request timeout";
    }
    if (messageOrError instanceof Error) {
        return messageOrError.message
    }
    return String(messageOrError);
}

export function formatSchemaErrors(errors: {message?: string}[] | null | undefined): string {
    return errors != null ? errors.map(({message}) => message).join(", ") : "";
}

export class VerboseError extends Error {

    messageVerbose: string;

    constructor(message: string, messageVerbose: string | null = null) {
        super(message);
        this.messageVerbose = messageVerbose ?? message;
    }

}

export class NodeError extends VerboseError {

    constructor(method: string, rootApi: string, location: string, title: string | null, messageOrError: Error | string,
                details: string | null = null) {
        const message = (title ? `${title}: ` : "") + extractMessage(messageOrError);
        const messageVerbose = `${method} ${rootApi}${location}: ${message}` + (details ? `: ${details}` : "");
        super(message, messageVerbose);
    }

}

export class BodyError extends VerboseError {

    constructor(details: string | null = null) {
        const message = "Server returned incorrect Body";
        const messageVerbose = `${message}` + (details ? `: ${details}` : "");
        super(message, messageVerbose);
    }

}

export class NamingError extends VerboseError {

    constructor(method: string, messageOrError: Error | string, details: string | null = null) {
        const message = "Naming service access error: " + extractMessage(messageOrError);
        const messageVerbose = `${method}(): ${message}` + (details ? `: ${details}` : "");
        super(message, messageVerbose);
    }

}

export class NodeApiError extends Error {

    errorCode: string;

    constructor(errorCode: string, message: string) {
        super(message);
        this.errorCode = errorCode;
    }

}

export class HomeNotConnectedError extends VerboseError {

    constructor() {
        super("Not connected to home");
    }

    setQuery(method: string, location: string): void {
        this.messageVerbose = `${method} ${location}: ${this.message}`
    }

}

export class NameResolvingError extends Error {

    nodeName: string | null;

    constructor(nodeName: string | null) {
        super("Name not found: " + nodeName);
        this.nodeName = nodeName;
    }

}
