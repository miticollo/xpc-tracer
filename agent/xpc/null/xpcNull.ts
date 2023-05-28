import {XpcObject} from "../xpcObject.js";

export class XpcNull extends XpcObject{
    public getRawData(): null {
        return null;
    }

    toString(): string {
        return "null";
    }
}