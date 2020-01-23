import { getTimelineAt } from "state/timeline/selectors";
import { atOwner } from "util/misc";
import { goToTimeline } from "state/navigation/actions";

export function transform(srcInfo, dstInfo) {
    const before = dstInfo.parameters["before"];
    return [goToTimeline(before != null ? parseInt(before) : null)];
}

export function build(state, info) {
    info = info.sub("timeline");
    const at = getTimelineAt(state);
    info = at < Number.MAX_SAFE_INTEGER ? info.withParameter("before", at) : info;
    return info.withTitle("Timeline" + atOwner(state));
}
