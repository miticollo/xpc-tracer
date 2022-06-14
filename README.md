# XPC tracer
A tracer based on [frida](https://frida.re/) for XPC messages in iOS and macOS.

This project is a variant of [xpcspy](https://github.com/hot3eed/xpcspy).
In particular for my purpose I didn't develop a Python script with options to filter messages based on direction 
(incoming/outgoing).
Anyway I created an agent to hook some `xpc_connection_send_message` functions and print their arguments in the best way 
possible.
As you will notice I print arguments in-depth including parsed bplist00, bplist15, bplist16 and bplist17 using 
[jlutil](http://newosxbook.com/tools/simplistic.html).

This is a PoC for [AnForA](https://people.unipmn.it/sguazt/publication/anglano-2019-anfora/Anglano-2019-AnForA.pdf).

## Requirements
* A **jailbroken** iDevice

## Quick-start guide
I prefer using frida inside [Python virtual environment (venv)](https://docs.python.org/3/library/venv.html).

### How to create venv, compile & load
```sh
$ git clone https://github.com/lorenzoferron98/xpc-tracer.git
$ cd xpc-tracer/
$ python -m venv .venv                                        # create virtual env
$ source .venv/bin/activate
$ npm install                                                 # nodejs required
$ pip install frida-tools
$ frida -U -f ph.telegra.Telegraph --no-pause -l _agent.js    # target app: Telegram
```
### Patch IPA
To use agent, target application **must** be able to execute system call `system(2)`.
So you **must** patch IPA.
1. Dump `enitlements.plist` using `ldid -e ${APP_PATH}`
2. Append
    ```xml
    <key>com.apple.private.security.no-container</key>
    <true/>
    ```
   to `enitlements.plist`.
3. Signing application with `ldid -Senitlements.plist ${APP_PATH}`

## Example of Output
```text
xpc_connection_send_message_with_reply_sync(
        connection = {
                com.apple.contactsd = {
                        service: OS_xpc_dictionary = {
                                EnableTransactions: OS_xpc_bool = true,
                                LimitLoadToSessionType: OS_xpc_string = System,
                                MachServices: OS_xpc_dictionary = {
                                        com.apple.contactsd.launch-services-proxy: OS_xpc_mach_send = <mach send right: 0x283cb51e0> { name = 0, right = send, urefs = 1 },
                                        com.apple.contactsd: OS_xpc_mach_send = <mach send right: 0x283cb40a0> { name = 0, right = send, urefs = 1 }
                                },
                                Label: OS_xpc_string = com.apple.contactsd,
                                TimeOut: OS_xpc_int64 = 30,
                                OnDemand: OS_xpc_bool = true,
                                LastExitStatus: OS_xpc_int64 = 0,
                                PID: OS_xpc_int64 = 279,
                                Program: OS_xpc_string = /System/Library/Frameworks/Contacts.framework/Support/contactsd,
                                ProgramArguments: OS_xpc_array = [
                                        : OS_xpc_string = /System/Library/Frameworks/Contacts.framework/Support/contactsd,
                                ]
                        }
                }
        },
        message: OS_xpc_dictionary = {
                f: OS_xpc_uint64 = 33,
                root: OS_xpc_data = {
                        format = bplist16,
                        body = {
   0: encodedContactsAndCursorForFetchRequest:withReply:
   1: v@:@@?
   2: 
      0: 
         $class: CNContactFetchRequest
         keysToFetch: 
            $class: NSArray
            NS.objects: 
               0: 
                  $class: CNAggregateKeyDescriptor
                  _keyDescriptors: 
                     $class: NSArray
                     NS.objects: 
                        0: namePrefix灴潲o牆整捨湡浥偲敦
                        1: givenName
                        2: middleName
                        3: familyName
                        4: nameSuffix
                        5: contactType
                        6: organizationName潲条湩穡瑩潮乡浥닦鶡ꧧꦡꧦ
                        7: nickname扰汩獴ㄶꂥȀ


                  _privateDescription: Formatter style: 0閦@

               1: phoneNumbers
               2: urlAddresses


         unifyResults: false
         sortOrder: 0
         onlyMainStore: true
         predicate: NULL
         mutableObjects: true
         rankSort: 
      1: NULL


                        }
                },
                proxynum: OS_xpc_uint64 = 1,
                replysig: OS_xpc_string = v32@?0@"NSData"8@"<CNEncodedFetchCursor><NSXPCProxyCreating>"16@"NSError"24,
                sequence: OS_xpc_uint64 = 3
        }
);
```
In this example Telegram call native function [`xpc_connection_send_message_with_reply_sync`](https://developer.apple.com/documentation/xpc/1448790-xpc_connection_send_message_with?language=objc&changes=latest_major)
to create a new contact (John Doe +1 212-456-7890).

The function has two arguments `connection` and `message`. The information for the former is retrieved using `launchctl list` query.
The latter is a dictionary with data in bplist16 format decoded using jlutil.

I don't know why jlutil print this "strange" chars. Moreover, it's not always possible to get information about `connection`.
In these cases `launchctl list` prints `error: OS_xpc_int64 = Could not find specified service`.
