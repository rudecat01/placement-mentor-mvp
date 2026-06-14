from state import MVPState

VERDICT_SCORES = {"correct": 1.0, "partially_correct": 0.5, "incorrect": 0.0}


def update_mastery_node(state: MVPState) -> dict:
    mastery = dict(state["skill_mastery"])
    sess = dict(state["dsa_session"])
    current_day = state.get("current_day", 1)

    last_eval = state.get("_last_eval")
    if last_eval and sess.get("active_problem"):
        topic = sess["active_problem"]["topic"]
        outcome = VERDICT_SCORES.get(last_eval.get("verdict"), 0.0)
        mastery[topic] = round(mastery.get(topic, 0.3) + 0.15 * (outcome - mastery.get(topic, 0.3)), 2)
        sess["active_problem"] = None
        sess["awaiting_submission"] = False
        current_day += 1

    last_report = state.get("_last_interview_report")
    if last_report:
        scores = last_report.get("scores", [])
        if scores:
            avg = sum(s["score"] for s in scores) / len(scores)
            mastery["communication"] = round(
                mastery.get("communication", 0.3) + 0.2 * (avg / 10 - mastery.get("communication", 0.3)), 2
            )

    return {
        "skill_mastery": mastery,
        "dsa_session": sess,
        "current_day": current_day,
        "_last_eval": None,
        "_last_interview_report": None,
    }
