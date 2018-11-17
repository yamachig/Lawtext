export type EditTable<T> = Array<EditTableRow<T>>;
export type EditTableRow<T> = AddRow<T> | RemoveRow<T> | SameRow<T>;
export type AddRow<T> = [null, EditTableItem<T>];
export type RemoveRow<T> = [EditTableItem<T>, null];
export type SameRow<T> = [EditTableItem<T>, EditTableItem<T>];
export type EditTableItem<T> = [number, T];

export const compare = <T>(A: T[], B: T[]) => {
    const M = A.length;
    const N = B.length;
    const V: number[] = new Array(M + N + 1);
    const E: boolean[] = new Array(M + N + 1);
    const S: Array<Array<[number, number]>> = new Array(M + N + 1);
    const offset = M;

    for (let D = 0; D <= M + N; D++) {
        const min = D <= M ? -D : D - 2 * M;
        const max = D <= N ? D : -D + 2 * N;

        for (let k = min; k <= max; k += 2) {
            let i: number;

            let prevS: Array<[number, number]>;

            // initialize
            if (D === 0) {
                i = 0;
                prevS = [];
                E[offset + k] = false;
            }

            // on the edge
            else if (k === -D) {
                i = V[offset + k + 1] + 1;
                prevS = S[offset + k + 1];
                E[offset + k] = true;
            } else if (k === D) {
                i = V[offset + k - 1];
                prevS = S[offset + k - 1];
                E[offset + k] = false;

            }

            // default
            else {
                const ti = V[offset + k + 1] + 1;
                const te = E[offset + k + 1];
                const fi = V[offset + k - 1];
                const fe = E[offset + k - 1];

                if (fi < ti) {
                    i = ti;
                    prevS = S[offset + k + 1];
                    E[offset + k] = true;
                } else if (ti < fi) {
                    i = fi;
                    prevS = S[offset + k - 1];
                    E[offset + k] = false;

                }
                // ti === fi
                else if (te) {
                    i = ti;
                    prevS = S[offset + k + 1];
                    E[offset + k] = true;
                } else if (!fe) {
                    i = fi;
                    prevS = S[offset + k - 1];
                    E[offset + k] = false;


                }

                // default
                else {
                    i = ti;
                    prevS = S[offset + k + 1];
                    E[offset + k] = true;
                }

            }

            while (i < M && i + k < N && A[i] === B[i + k]) {
                i += 1;
            }

            V[offset + k] = i;
            S[offset + k] = [...prevS, [i, i + k]];

            if (k === N - M && i === M) {
                return generateEditTable(A, B, prevS);
            }
        }
    }
    throw new Error("never");
}

const generateEditTable = <T>(A: T[], B: T[], origEditScript: Array<[number, number]>) => {
    const M = A.length;
    const N = B.length;
    let i = 0; // 1 indexed
    let j = 0; // 1 indexed
    const table: EditTable<T> = [];
    const extEditScript = [...origEditScript, [M, N]];
    const editScript: Array<[number, number]> = [];
    for (let p = extEditScript.length - 1; 0 <= p; p--) {
        const [i1, j1] = extEditScript[p];
        editScript.unshift([i1, j1]);

        if (i1 === 0 && j1 === 0) {
            continue;
        }

        const [i0, j0] = 0 < p ? extEditScript[p - 1] : [0, 0];
        const [k0, k1] = [j0 - i0, j1 - i1];

        if (k1 === k0) {
            continue;
        } else if (k1 === k0 + 1) {
            editScript.unshift([i0, j0 + 1]);
        } else if (k1 === k0 - 1) {
            editScript.unshift([i0 + 1, j0]);
        } else {
            throw new Error(JSON.stringify({ i, j, M, N }));
        }
    }
    for (const [ei, ej] of editScript) {
        if (ei === i && ej === j) continue;

        if (ei - i === ej - j) {
            for (let [ci, cj] = [i + 1, j + 1]; ci <= ei; ci++ , cj++) {
                table.push([
                    [ci - 1, A[ci - 1]],
                    [cj - 1, B[cj - 1]],
                ]);
            }

        } else if (ei === i) {
            for (let cj = j + 1; cj <= ej; cj++) {
                table.push([
                    null,
                    [cj - 1, B[cj - 1]],
                ]);
            }

        } else if (ej === j) {
            for (let ci = i + 1; ci <= ei; ci++) {
                table.push([
                    [ci - 1, A[ci - 1]],
                    null,
                ]);
            }

        } else {
            throw new Error(JSON.stringify({ i, j, ei, ej, editScript }));
        }
        [i, j] = [ei, ej];
    }

    return table;
}