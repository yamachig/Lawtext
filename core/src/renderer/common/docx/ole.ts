const assert = (v: unknown) => {
    if (!v) throw new Error("Assertion Error");
};

const numToBytes = (n: number, byteLength: number) => {
    const hexStr = n.toString(16).padStart(byteLength * 2, "0");

    const bytes = [];
    for (let b = 0; b < byteLength; b++) bytes.unshift(hexStr.slice(b * 2, b * 2 + 2));

    return bytes;
};

const numTo4Bytes = (n: number) => numToBytes(n, 4);

const bytesArrayToUint8Array = (ba: string[]) => {
    const numbers = [];
    for (const bytesStr of ba) {
        if (typeof bytesStr !== "string") console.error(bytesStr);
        const byteStrs = bytesStr.trim().split(" ");
        numbers.push(...byteStrs.map(bs => Number.parseInt(bs, 16)));
    }
    return new Uint8Array(numbers);
};

export const makePDFOLE = (pdfBuf: ArrayBuffer) => {

    // References:
    //
    // MS-CFB
    // https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-cfb/53989ce4-7b05-4f8d-829b-d08d6148375b
    //
    // OLE2.0 Format Structures
    // https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-oleds/8c37e725-2578-4ea1-86c4-4be0f8d43284
    //
    // ObjInfo Stream
    // https://learn.microsoft.com/en-us/openspecs/office_file_formats/ms-doc/13ba10a8-d8b2-433b-bf3b-ec238dc8f9ce

    // Although a file less than 4096 bytes should be allocated as a mini stream,
    // we zero-pad the file to be allocated as a regular stream for simplicity.
    const contentsBuf = (() => {
        if (pdfBuf.byteLength < 4096) {
            const ret = new Uint8Array(4096);
            ret.set(new Uint8Array(pdfBuf), 0);
            return ret;
        } {
            return pdfBuf;
        }
    })();

    const nContentsSectors = Math.ceil(contentsBuf.byteLength / 512);
    const nNotFATSectors = (
        nContentsSectors
        + 2 // Directory Sector,
        + 1 // MiniFAT Sector,
        + 1 // Mini Stream Sector,
    );
    const { nDIFATSectors, nFATSectors } = (() => {
        if (nNotFATSectors <= 109 * (128 - 1)) {
            return {
                nDIFATSectors: 0,
                nFATSectors: Math.ceil(nNotFATSectors / (128 - 1)),
            };
        } else {
            const nDIFATSectors = (
                (nNotFATSectors - (109 * (128 - 1)))
                / ((128 - 1) * (128 - 1) - 1)
            );
            const nFATSectors = 109 + nDIFATSectors * (128 - 1);
            return { nDIFATSectors, nFATSectors };
        }
    })();

    // Sector[0]: FAT Sector[0]
    // Sector[1]: Directory Sector[0]
    // Sector[2]: MiniFAT Sector
    // Sector[3]: Mini Stream Sector
    // Sector[4]: Directory Sector[1]
    // Sector[5]: DIFAT Sector[0] // if exists
    // .........: DIFAT Sector[.]
    // .........: DIFAT Sector[.]
    // Sector[.]: FAT Sector[1] // if exists
    // .........: FAT Sector[.]
    // .........: FAT Sector[.]
    // Sector[.]: "CONTENTS" Data Sector[0]
    // .........: "CONTENTS" Data Sector[.]
    // .........: "CONTENTS" Data Sector[.]

    const firstDIFATSectorLocation = (nDIFATSectors === 0) ? 0xfffffffe : 0x00000005;

    const secondFATSectorLocation = 5 + nDIFATSectors;

    const firstContentsSectorLocation = 5 + nDIFATSectors + (nFATSectors - 1);

    const AllDIFATArray = [
        0x00000000,
        ...Array.from({ length: nFATSectors - 1 }, (_, i) => secondFATSectorLocation + i),
    ];

    for (let i = AllDIFATArray.length; i < 109; i++) {
        AllDIFATArray.push(0xffffffff);
    }

    const header = bytesArrayToUint8Array([
        // --------     00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f

        /* 00000000 */ "d0 cf 11 e0 a1 b1 1a e1 00 00 00 00 00 00 00 00",
        /* 00000010 */ "00 00 00 00 00 00 00 00 3e 00 03 00 fe ff 09 00",
        //                                            ^ [0x001A]: Major Version (0x0003)
        //                                                        ^ [0x001E]: Sector Shift (sector size) (0x0009: 512 bytes)
        /* 00000020 */ "06 00 00 00 00 00 00 00 00 00 00 00",
        //              ^ [0x0020]: Mini Sector Shift (0x0006: 64 bytes)
        /*                                      0000002C */ ...numTo4Bytes(nFATSectors),
        //                                                  ^ [0x002C]: Number of FAT sectors
        /* 00000030 */ "01 00 00 00 00 00 00 00 00 10 00 00 02 00 00 00",
        //              ^ [0x0030]: First Directory Sector Location (0x00000001)
        //                                      ^ [0x0038]: Mini Stream Cutoff Size (0x00001000: 4096 bytes)
        //                                                  ^ [0x003C]: First Mini FAT Sector Location (0x00000002)
        /* 00000040 */ "01 00 00 00",
        //              ^ [0x0040]: Number of Mini FAT sectors (0x00000001)
        /*                          XX XX XX XX */
        /*                       */ ...numTo4Bytes(firstDIFATSectorLocation),
        //                          ^ [0x0044]: First DIFAT Sector Location
        /*                                      XX XX XX XX */
        /*                                   */ ...numTo4Bytes(nDIFATSectors),
        //                                      ^ [0x00048]: Number of DIFAT Sectors
        /*                                                  XX XX XX XX */
        /*                                               */ ...AllDIFATArray.slice(0, 109).map(numTo4Bytes).flat(),
        //                                                  ^ [0x004C]: DIFAT[0]
    ]);
    assert(header.byteLength === 0x0200);

    const DIFATArrayInSectors = AllDIFATArray.slice(109);

    const DIFATSectors = Array.from({ length: nDIFATSectors }, (_, i) => {
        const DIFATArray = DIFATArrayInSectors.slice(i * (128 - 1), (i + 1) * (128 - 1));

        for (let j = DIFATArray.length; j < (128 - 1); j++) {
            DIFATArray.push(0xffffffff);
        }

        if (i < nDIFATSectors - 1) {
            DIFATArray.push(firstDIFATSectorLocation + i + 1);
        } else {
            DIFATArray.push(0xffffffff);
        }

        const sector = bytesArrayToUint8Array(DIFATArray.map(numTo4Bytes).flat());
        assert(sector.byteLength === 0x0200);

        return sector;
    });

    const AllFATArray = [
        0xfffffffd, // Sector[0]: FAT Sector[0]
        0x00000004, // Sector[1]: Directory Sector[0]
        0xfffffffe, // Sector[2]: MiniFAT Sector
        0xfffffffe, // Sector[3]: Mini Stream Sector
        0xfffffffe, // Sector[4]: Directory Sector[1]
        ...Array.from({ length: nDIFATSectors }, () => 0xfffffffc), // DIFAT Sector[0...]
        ...Array.from({ length: nFATSectors - 1 }, () => 0xfffffffd), // FAT Sector[1...]
        ...Array.from({ length: nContentsSectors }, (_, i) => (
            (i < nContentsSectors - 1)
                ? (firstContentsSectorLocation + i + 1)
                : 0xfffffffe
        )), // "CONTENTS" Data Sector[1...]
    ];

    const FATSectors = Array.from({ length: nFATSectors }, (_, i) => {
        const FATArray = AllFATArray.slice(i * 128, (i + 1) * 128);

        for (let j = FATArray.length; j < 128; j++) {
            FATArray.push(0xffffffff);
        }

        const sector = bytesArrayToUint8Array(FATArray.map(numTo4Bytes).flat());
        assert(sector.byteLength === 0x0200);

        return sector;
    });

    const directorySector0 = bytesArrayToUint8Array([
        // Directory "Root Entry"
        // --------     00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f

        /* ______00 */ "52 00 6f 00 6f 00 74 00 20 00 45 00 6e 00 74 00",
        /* ______10 */ "72 00 79 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______20 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______30 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______40 */ "16 00 05 00 ff ff ff ff ff ff ff ff 02 00 00 00",
        /* ______50 */ "65 ca 01 b8 fc a1 d0 11 85 ad 44 45 53 54 00 00",
        /* ______60 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______70 */ "00 00 00 00 03 00 00 00 00 01 00 00 00 00 00 00",
        //                          ^ [0x__74]: first sector of the mini stream (0x00000003)

        // Stream "\x01Ole"
        // --------     00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f

        /* ______00 */ "01 00 4f 00 6c 00 65 00 00 00 00 00 00 00 00 00",
        /* ______10 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______20 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______30 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______40 */ "0a 00 02 01 ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ______50 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______60 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______70 */ "00 00 00 00 00 00 00 00 14 00 00 00 00 00 00 00",
        //                          ^ [0x__74]: Starting Sector Location (mini stream) (0x00000000)

        // Stream "\x01CompObj"
        // --------     00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f

        /* ______00 */ "01 00 43 00 6f 00 6d 00 70 00 4f 00 62 00 6a 00",
        /* ______10 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______20 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______30 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______40 */ "12 00 02 01 01 00 00 00 03 00 00 00 ff ff ff ff",
        /* ______50 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______60 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______70 */ "00 00 00 00 01 00 00 00 5d 00 00 00 00 00 00 00",
        //                          ^ [0x__74]: Starting Sector Location (mini stream) (0x00000001)

        // Stream "\x03ObjInfo"
        // --------     00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f

        /* ______00 */ "03 00 4f 00 62 00 6a 00 49 00 6e 00 66 00 6f 00",
        /* ______10 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______20 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______30 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______40 */ "12 00 02 01 ff ff ff ff 04 00 00 00 ff ff ff ff",
        /* ______50 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______60 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______70 */ "00 00 00 00 03 00 00 00 06 00 00 00 00 00 00 00",
        //                          ^ [0x__74]: Starting Sector Location (mini stream) (0x00000003)

    ]);
    assert(directorySector0.byteLength === 0x0200);

    const directorySector1 = bytesArrayToUint8Array([
        // Stream "CONTENTS"
        // --------     00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f

        /* ______00 */ "43 00 4f 00 4e 00 54 00 45 00 4e 00 54 00 53 00",
        /* ______10 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______20 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______30 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______40 */ "12 00 02 00 ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ______50 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______60 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______70 */ "00 00 00 00",
        /*                          XX XX XX XX */
        /*                       */ ...numTo4Bytes(firstContentsSectorLocation),
        //                          ^ [0x__74]: Starting Sector Location
        /*                                      XX XX XX XX XX XX XX XX */
        /*                                   */ ...numToBytes(contentsBuf.byteLength, 8),
        //                                      ^ [0x__78]: Stream Size

        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",

    ]);
    assert(directorySector1.byteLength === 0x0200);

    const miniFATSector = bytesArrayToUint8Array([
        // --------     00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f

        /* ______00 */ "fe ff ff ff 02 00 00 00 fe ff ff ff fe ff ff ff",

        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",
        /* ________ */ "ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff",

    ]);
    assert(miniFATSector.byteLength === 0x0200);

    const miniStreamSector = bytesArrayToUint8Array([
        // Stream "\x01Ole" Data
        // --------     00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f

        /* ______00 */ "01 00 00 02 00 00 00 00 00 00 00 00 00 00 00 00",
        //                          ^ [0x__04]: OLEStream Flags (=> 0x00000000)
        /* ______10 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______20 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______30 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",

        // Stream "\x01CompObj" Data
        // --------     00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f

        /* ______00 */ "01 00 fe ff 03 0a 00 00 ff ff ff ff 65 ca 01 b8",
        /* ______10 */ "fc a1 d0 11 85 ad 44 45 53 54 00 00 11 00 00 00",
        /* ______20 */ "41 63 72 6f 62 61 74 20 44 6f 63 75 6d 65 6e 74",
        /* ______30 */ "00 00 00 00 00 14 00 00 00 41 63 72 6f 62 61 74",

        /* ______40 */ "2e 44 6f 63 75 6d 65 6e 74 2e 44 43 00 f4 39 b2",
        /* ______50 */ "71 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______60 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______70 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",

        // Stream "\x03ObjInfo" Data
        // --------     00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f

        /* ______00 */ "40 00 03 00 01 00 00 00 00 00 00 00 00 00 00 00",
        /* ______10 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______20 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ______30 */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",

        // --------     00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f

        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        /* ________ */ "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",

    ]);
    assert(miniStreamSector.byteLength === 0x0200);


    const contentsSectors = Array.from({ length: nContentsSectors }, (_, i) => {
        const sector = new Uint8Array(512);
        sector.set(new Uint8Array(contentsBuf.slice(i * 512, (i + 1) * 512)), 0);
        assert(sector.byteLength === 0x0200);

        return sector;
    });

    const allSectors = [
        header,
        FATSectors[0],
        directorySector0,
        miniFATSector,
        miniStreamSector,
        directorySector1,
        ...DIFATSectors,
        ...FATSectors.slice(1),
        ...contentsSectors,
    ];

    const retBuf = new Uint8Array(allSectors.map(a => a.byteLength).reduce(((s, v) => s + v), 0));

    let offset = 0;
    for (const sector of allSectors) {
        retBuf.set(sector, offset);
        offset += sector.byteLength;
    }

    return retBuf;
};
