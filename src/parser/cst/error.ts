export class ErrorMessage {
    public constructor(
        public message: string,
        // public range: [start: number, end: number],
        public location: [
            start:{offset: number, line: number, column: number},
            end:{offset: number, line: number, column: number},
        ],
    ) {}
}
