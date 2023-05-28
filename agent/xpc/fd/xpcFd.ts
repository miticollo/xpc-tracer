import {XpcObject} from "../xpcObject.js";

export class XpcFd extends XpcObject {
    public static readonly xpc_fd_dup = new NativeFunction(
        Module.getExportByName(null, "xpc_fd_dup"), "int", ["pointer"]
    )

    getRawData(): number {
        return XpcFd.xpc_fd_dup(this.pointer);
    }

    toString(): string {
        return String(this.getRawData());
    }
}