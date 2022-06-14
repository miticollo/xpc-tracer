import {XpcObject} from "../xpcObject";

export class XpcEndpoint extends XpcObject {
    getRawData(): Object {
        return this;
    }

    toString(): string {
        // @ts-ignore
        return XpcEndpoint.xpc_copy_description(this.pointer).readCString();
    }
}