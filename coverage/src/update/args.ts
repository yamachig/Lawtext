export interface UpdateArgs {
    force: boolean,
    retry: boolean,
    dryRun: boolean,
    parallel: boolean,
    maxDiffLength: number,
    before?: Date,
    lawID?: string,
    notificationEndpoint?: string,
}
