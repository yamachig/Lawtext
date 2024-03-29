export interface UpdateArgs {
    force: boolean,
    retry: boolean,
    dryRun: boolean,
    noParallel: boolean,
    maxDiffLength: number,
    before?: Date,
    lawID?: string,
    notificationEndpoint?: string,
}
