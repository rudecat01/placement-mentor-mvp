"""
Load Calculator — Preparation Load Index (PLI)
Computes per-topic load and overall overload ratio from StudentState.
"""

MINUTES_PER_MASTERY_UNIT = 180  # ~3 hrs per 10% mastery improvement
TARGET_MASTERY = 0.80           # Gate threshold per topic


def compute_load_summary(state) -> dict:
    """
    Given a StudentState, compute the full Load & Capacity summary.
    Returns a dict ready to be serialised as a JSON response.
    """
    budget = state.profile.daily_time_budget_minutes   # capacity (minutes/day)
    days_left = max(1, state.remaining_days)
    topics = state.topic_states
    ptg = state.overall_ptg or 0.0

    topic_loads = []
    total_minutes_needed = 0

    for topic_id, ts in topics.items():
        current = ts.mastery
        deficit = max(0.0, TARGET_MASTERY - current)
        mins_needed = deficit * MINUTES_PER_MASTERY_UNIT

        # PTG penalty: if the student consistently underperforms in practice,
        # add remedial overhead proportional to the gap.
        if ptg > 0.20:
            mins_needed *= (1 + ptg)

        daily_contribution = mins_needed / days_left
        total_minutes_needed += mins_needed

        topic_loads.append({
            "topic_id": topic_id,
            "topic_name": ts.topic_name,
            "current_mastery": round(current, 2),
            "target_mastery": TARGET_MASTERY,
            "deficit": round(deficit, 2),
            "minutes_needed_total": round(mins_needed),
            "daily_contribution_minutes": round(daily_contribution, 1),
            "status": (
                "COMPLETE"  if deficit == 0 else
                "CRITICAL"  if daily_contribution > budget * 0.4 else
                "AT_RISK"   if daily_contribution > budget * 0.2 else
                "OK"
            )
        })

    # Sort: biggest bottlenecks first
    topic_loads.sort(key=lambda x: x["daily_contribution_minutes"], reverse=True)

    daily_load_total = total_minutes_needed / days_left
    overload_ratio = daily_load_total / budget if budget > 0 else 99.0
    projected_days_needed = total_minutes_needed / budget if budget > 0 else 9999

    if overload_ratio < 0.85:
        load_status = "ON_TRACK"
    elif overload_ratio <= 1.0:
        load_status = "AT_RISK"
    else:
        load_status = "OVERLOADED"

    return {
        "user_id":                 state.profile.id,
        "name":                    state.profile.name,
        "capacity_minutes":        budget,
        "daily_load_minutes":      round(daily_load_total, 1),
        "overload_ratio":          round(overload_ratio, 3),
        "load_status":             load_status,
        "remaining_days":          days_left,
        "projected_days_needed":   round(projected_days_needed),
        "deadline_met":            projected_days_needed <= days_left,
        "ptg":                     round(ptg, 3),
        "topic_loads":             topic_loads,       # full list (sorted)
        "top_bottlenecks":         topic_loads[:3],   # worst 3 for the panel
        "total_minutes_remaining": round(total_minutes_needed),
        "completed_topics":        sum(1 for t in topic_loads if t["status"] == "COMPLETE"),
        "total_topics":            len(topic_loads),
    }
