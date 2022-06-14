import {XpcObject} from "./xpcObject";

export class XpcUnknown extends XpcObject {
    getRawData(): unknown {
        return;
    }

    toString(): string {
        return "unknown";
    }
}