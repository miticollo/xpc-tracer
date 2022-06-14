import {XpcObject} from "../xpcObject";

export class XpcNull extends XpcObject{
    public getRawData(): null {
        return null;
    }

    toString(): string {
        return "null";
    }
}