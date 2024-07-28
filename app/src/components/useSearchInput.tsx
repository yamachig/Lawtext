import React from "react";
import { lawTitleFusePromise, type LawListItem } from "../lawdata/searchLawID";
import type { FuseResult } from "fuse.js";
import { throttle } from "lawtext/dist/src/util";

export const useSearchInput = (options: {searchInputStyle?: React.CSSProperties}) => {

    const searchInputRef = React.useRef<HTMLInputElement>(null);

    const [editingKey, setEditingKey] = React.useState("");

    const [candidates, setCandidates] = React.useState<FuseResult<LawListItem>[]>();

    const [searchFocused, setSearchFocused] = React.useState<"on" | "leaving" | "off">("off");

    const updateCandidates = throttle(async (key: string) => {
        const fuse = await lawTitleFusePromise;
        const list = fuse.search(key, { limit: 10 }).filter(r => (r.score ?? 0) <= 0.3);
        list.sort((a, b) => (
            (a.score !== undefined && b.score !== undefined && a.score !== b.score)
                ? a.score - b.score
                : a.item.lawTitle.length - b.item.lawTitle.length
        ));
        setCandidates(list);
    }, 300, 30);

    const lawSearchKeyOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingKey(e.target.value);
        updateCandidates(e.target.value);
    };

    const searchInput = (
        <input
            name="lawSearchKey"
            ref={searchInputRef}
            onChange={lawSearchKeyOnChange}
            onFocus={() => {
                setSearchFocused("on");
                updateCandidates(editingKey);
            }}
            onBlur={() => {
                if (searchFocused !== "leaving") {
                    setSearchFocused("off");
                }
            }}
            className="form-control search-law-textbox"
            style={{
                ...options.searchInputStyle,
            }}
            placeholder="法令名か法令番号を検索" aria-label="法令名か法令番号を検索"
            value={editingKey}
        />);

    const searchDropdown = <>
        {(searchFocused !== "off" && editingKey) && (
            <ul className="dropdown-menu show">
                {candidates?.map((r, i) => (<li key={i}>
                    <a className="dropdown-item small lh-1" href={`#/v1:${r.item.lawID}`}
                        onMouseDown={() => {
                            setSearchFocused("leaving");
                        }}
                        onClick={() => {
                            setEditingKey(r.matches?.[0].value ?? editingKey);
                            setSearchFocused("off");
                        }}
                        style={{ whiteSpace: "normal" }}
                    >
                        <span>{r.item.lawTitle}</span><br/>
                        <small style={{ display: "inline-block" }}>（{r.item.lawNum}）</small>
                        {r.matches?.[0].key === "abbrev" && <><br/><small>（略称：{r.matches?.[0].value}）</small></>}
                        {r.matches?.[0].key === "lawID" && <><br/><small style={{ whiteSpace: "nowrap" }}>（法令ID：{r.matches?.[0].value}）</small></>}
                    </a>
                </li>))}
            </ul>
        )}
    </>;

    return {
        editingKey,
        searchInputRef,
        searchInput,
        searchDropdown,
    };
};

export default useSearchInput;
