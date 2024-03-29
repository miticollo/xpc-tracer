import {XpcObject} from "../xpcObject.js";

export class XpcMachSend extends XpcObject {
    getRawData(): Object {
        return this;
    }

    toString(): string {
        // @ts-ignore
        return XpcMachSend.xpc_copy_description(this.pointer).readCString();
    }
}