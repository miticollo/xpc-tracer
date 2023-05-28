import {XpcObject} from "../xpcObject.js";

export class XpcEndpoint extends XpcObject {
    getRawData(): Object {
        return this;
    }

    toString(): string {
        // @ts-ignore
        return XpcEndpoint.xpc_copy_description(this.pointer).readCString();
    }
}