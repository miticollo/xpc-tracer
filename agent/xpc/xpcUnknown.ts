import {XpcObject} from "./xpcObject.js";

export class XpcUnknown extends XpcObject {
    getRawData(): unknown {
        return;
    }

    toString(): string {
        return "unknown";
    }
}