export class ErrorMessage {
    public constructor(
        public message: string,
        public range: [start: number, end: number],
    ) {}
}
