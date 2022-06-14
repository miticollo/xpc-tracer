import {XpcObject} from "../xpcObject";

export class XpcData extends XpcObject {
    public static readonly xpc_data_get_bytes_ptr = new NativeFunction(
        Module.getExportByName(null, "xpc_data_get_bytes_ptr"),
        "pointer", ["pointer"]
    )

    public static readonly xpc_data_get_length = new NativeFunction(
        Module.getExportByName(null, "xpc_data_get_length"),
        "size_t", ["pointer"]
    )

    public static readonly system = new NativeFunction(
        Module.getExportByName(null, "system"),
        "int", ["pointer"]
    )

    public static readonly write = new NativeFunction(
        Module.getExportByName(null, 'write'),
        'int', ['int', 'pointer', 'int']
    )

    public static readonly creat = new NativeFunction(
        Module.getExportByName(null, "creat"),
        "int", ["pointer", "int"]
    )

    public static readonly close = new NativeFunction(
        Module.getExportByName(null, "close"),
        "int", ["int"]
    )

    public static readonly umask = new NativeFunction(
        Module.getExportByName(null, "umask"),
        "int", ["int"]
    )

    private static readonly fs = require('frida-fs');

    public getRawData(): { readonly format: string, readonly body: string } {
        const format = XpcData.xpc_data_get_bytes_ptr(this.pointer).readCString(8)
        if (format == null) throw Error("String at " + this.pointer + " is null.")
        return {
            "format": format,
            "body": this.parse()
        }
    }

    public formatData(depth: number): string {
        let str: string = "{\n"
        const indent: string = "\t"
        const map = this.getRawData()
        str += `${indent.repeat(depth)}format = ${map.format},\n`
        str += `${indent.repeat(depth)}body = {\n`
        str += map.body
        str += `${indent.repeat(depth)}}`
        str += `\n${indent.repeat(depth - 1)}}`
        return str
    }

    private parse(): string {
        let length: UInt64 = XpcData.xpc_data_get_length(this.pointer)
        let bytesPtr: NativePointer = XpcData.xpc_data_get_bytes_ptr(this.pointer)
        let input: string = `/tmp/${uuid()}.plist`
        XpcData.umask(0)
        let fd: number = XpcData.creat(Memory.allocUtf8String(input), 0o666)
        XpcData.write(fd, bytesPtr, length.toNumber())
        XpcData.close(fd)
        let output: string = `/tmp/${uuid()}.txt`
        XpcData.system(Memory.allocUtf8String(`jlutil -x ${input} > ${output}`))
        let str = XpcData.fs.readFileSync(output)
        XpcData.system(Memory.allocUtf8String(`rm ${input} ${output}`))
        return str
    }
}

function uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
