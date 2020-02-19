import { call, put, select } from 'redux-saga/effects';

import { Home, NodeName } from "api";
import { errorThrown } from "state/error/actions";
import { postingReplyFailed } from "state/postingreply/actions";
import { getOwnerName } from "state/owner/selectors";
import { getPosting } from "state/postings/selectors";
import { getWindowSelectionHtml, urlWithParameters } from "util/misc";
import { getSetting } from "state/settings/selectors";

export function* postingReplySaga() {
    const {posting, rootNodePage, ownerName, rootHomePage, subjectPrefix, preambleTemplate, quoteAll} =
        yield select(state => ({
            posting: getPosting(state, state.postingReply.postingId),
            rootNodePage: state.node.root.page,
            ownerName: getOwnerName(state),
            rootHomePage: state.home.root.page,
            subjectPrefix: getSetting(state, "posting.reply.subject-prefix"),
            preambleTemplate: getSetting(state, "posting.reply.preamble"),
            quoteAll: getSetting(state, "posting.reply.quote-all"),
        }));
    try {
        const name = NodeName.parse(ownerName).name;
        const subject = posting.body.subject && subjectPrefix
            ? subjectPrefix + " " + posting.body.subject : posting.body.subject;
        const preamble = preambleTemplate
            .replace("%POST%", `${rootNodePage}/post/${posting.id}`)
            .replace("%USER%", name);
        let text = getWindowSelectionHtml();
        if (!text && quoteAll) {
            text = posting.body.text;
        }
        const postingText = {
            bodySrc: JSON.stringify({
                subject,
                text: text ? `${preamble}\n>>>\n${text.trim()}\n>>>\n` : `${preamble}\n`
            }),
            bodySrcFormat: "markdown"
        };
        const data = yield call(Home.postDraftPosting, postingText);
        window.location = urlWithParameters(rootHomePage + "/compose", {"draft": data.id});
    } catch (e) {
        yield put(postingReplyFailed());
        yield put(errorThrown(e));
    }
}
