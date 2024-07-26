export declare function findComments(element: Node): ChildNode[];
export declare function html(strings: TemplateStringsArray, ...values: any[]): DocumentFragment;
export declare function ReapplyEvents(element: Element, clone: Element): void;
export declare function ReapplyEventsDeep(element: Element, clone: Element): void;
type EventObject = {
    listener: EventListener;
    options?: EventListenerOptions;
};
declare global {
    interface Window {
        eventListenersBeenInitialized: boolean;
    }
    interface Element {
        __eventListeners: Record<string, EventObject[]>;
        getEventListeners(): Record<string, EventObject[]>;
    }
}
export {};
