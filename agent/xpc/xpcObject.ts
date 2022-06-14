import {XpcInt64} from "./number/XpcInt64";

export abstract class XpcObject {
    public static readonly xpc_strerror = new NativeFunction(
        Module.getExportByName(null, "xpc_strerror"),
        "pointer", ["int64"]
    )

    public static readonly xpc_copy_description = new NativeFunction(
        Module.getExportByName(null, "xpc_copy_description"),
        "pointer", ["pointer"]
    )

    constructor(protected pointer: NativePointer) {}

    public getType(): string {
        return new ObjC.Object(this.pointer).$className
    }

    public printError(id: XpcInt64): string {
        // @ts-ignore
        return XpcObject.xpc_strerror(id.getRawData()).readCString();
    }

    public abstract getRawData(): Object | null | unknown
}