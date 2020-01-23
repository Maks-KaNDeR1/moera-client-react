import { goToPosting } from "state/navigation/actions";
import { getDetailedPosting, getDetailedPostingId } from "state/detailedposting/selectors";
import { atOwner } from "util/misc";

export function transform(srcInfo, dstInfo) {
    return [goToPosting(dstInfo.directories[1])];
}

export function build(state, info) {
    info = info.sub("post").sub(getDetailedPostingId(state));
    const posting = getDetailedPosting(state);
    const heading = posting != null ? posting.heading : "";
    return info.withTitle(heading + atOwner(state));
}
