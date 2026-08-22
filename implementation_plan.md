# Load & Capacity: Review Panel — Implementation Plan

## What "Load and Capacity" Means in This System

This is a placement preparation platform. The natural mapping is:

| Generic Concept | In Placement Mentor 2.0 |
|---|---|
| **Capacity** | Student's `daily_time_budget_minutes` — how much prep time they have per day |
| **Load** | Total preparation demand across all topics weighted by mastery deficit + deadline proximity |
| **Overload** | When `load > capacity` — they can't complete their prep in time at current pace |
| **Review Panel** | A single screen that surfaces load, capacity, overload risk, topic-level bottlenecks, and AI-suggested rebalancing |

---

## The Core Concept: Preparation Load Index (PLI)

For each topic, the **load** is how much work is needed to get it from current mastery to required mastery, divided by days left:

```
topic_load_minutes = (target_mastery - current_mastery) × minutes_to_master_per_unit
daily_load_total   = Σ topic_load_minutes / remaining_days
capacity           = daily_time_budget_minutes

overload_ratio     = daily_load_total / capacity
```

- `overload_ratio < 0.85` → On Track 🟢
- `0.85 – 1.0` → At Risk 🟡
- `> 1.0` → Overloaded 🔴

---

## Complete User Flow

```
Student opens Review Panel
        ↓
Frontend calls GET /api/review/load-summary?user_id=...
        ↓
Backend reads StudentState from DB:
  - daily_time_budget_minutes (capacity)
  - remaining_days
  - topic_states (current mastery per topic)
  - target_companies (company weights)
  - overall_ptg (performance transfer gap)
        ↓
Computes PLI per topic, overall overload ratio,
top 3 bottleneck topics, projected completion %
        ↓
Returns LoadCapacitySummary JSON
        ↓
Review Panel renders:
  - Capacity Bar (time budget vs estimated daily load)
  - Overload Status badge
  - Per-topic load breakdown (horizontal progress bars)
  - Projected readiness date vs actual deadline
  - Top bottlenecks with "Focus Now" quick actions
  - Budget Rebalance form (change daily budget / deadline)
```

---

## Proposed Changes

---

### Backend — New endpoint

#### [NEW] `server/routers/review_router.py`

```python
router = APIRouter(prefix="/api/review", tags=["Load & Capacity"])

@router.get("/load-summary")
async def get_load_capacity_summary(user_id: str = "usr_demo123"):
    """
    Returns a full load/capacity breakdown for the Review Panel.
    Computes Preparation Load Index (PLI) per topic and overall.
    """
    state = db.get_student_state(user_id)
    return compute_load_summary(state)
```

#### [NEW] `server/engine/scores/load_calculator.py`

Core computation logic:

```python
MINUTES_PER_MASTERY_UNIT = 180  # ~3 hrs per 10% mastery improvement
TARGET_MASTERY = 0.80           # Gate threshold per topic

def compute_load_summary(state: StudentState) -> dict:
    budget   = state.profile.daily_time_budget_minutes   # capacity
    days_left = max(1, state.remaining_days)
    topics   = state.topic_states
    ptg      = state.overall_ptg or 0.0

    topic_loads = []
    total_minutes_needed = 0

    for topic_id, ts in topics.items():
        current   = ts.mastery
        deficit   = max(0.0, TARGET_MASTERY - current)
        mins_needed = deficit * MINUTES_PER_MASTERY_UNIT
        # PTG penalty: if student fails in practice, add remedial load
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
            "status": "COMPLETE" if deficit == 0 else (
                "CRITICAL" if daily_contribution > budget * 0.4 else
                "AT_RISK"  if daily_contribution > budget * 0.2 else "OK"
            )
        })

    # Sort by daily contribution descending (biggest bottlenecks first)
    topic_loads.sort(key=lambda x: x["daily_contribution_minutes"], reverse=True)

    daily_load_total    = total_minutes_needed / days_left
    overload_ratio      = daily_load_total / budget if budget > 0 else 99.0
    projected_days_needed = total_minutes_needed / budget if budget > 0 else 9999

    if overload_ratio < 0.85:
        load_status = "ON_TRACK"
    elif overload_ratio <= 1.0:
        load_status = "AT_RISK"
    else:
        load_status = "OVERLOADED"

    return {
        "user_id":               state.profile.id,
        "name":                  state.profile.name,
        "capacity_minutes":      budget,
        "daily_load_minutes":    round(daily_load_total, 1),
        "overload_ratio":        round(overload_ratio, 3),
        "load_status":           load_status,
        "remaining_days":        days_left,
        "projected_days_needed": round(projected_days_needed),
        "deadline_met":          projected_days_needed <= days_left,
        "ptg":                   round(ptg, 3),
        "topic_loads":           topic_loads,          # full list
        "top_bottlenecks":       topic_loads[:3],      # worst 3 for panel
        "total_minutes_remaining": round(total_minutes_needed),
        "completed_topics":      sum(1 for t in topic_loads if t["status"] == "COMPLETE"),
        "total_topics":          len(topic_loads),
    }
```

#### [MODIFY] `server/main.py`
Register the new router:
```python
from .routers.review_router import router as review_router
app.include_router(review_router)
```

---

### Frontend — New page + hook

#### [NEW] `client/app/(app)/review/page.tsx`

The dedicated Review Panel page, accessible from the sidebar. Contains:
- **Capacity Gauge** — circular gauge showing `daily_load / capacity` (overload_ratio)  
- **Load Status Banner** — `ON_TRACK` / `AT_RISK` / `OVERLOADED` badge with color
- **Projected Completion Card** — "You'll be ready in X days, deadline in Y days"
- **Topic Load Breakdown** — horizontal progress bars per topic, colored by status
- **Top 3 Bottlenecks** — highlighted critical topics with "Start Practice" CTA button
- **Budget Rebalance Panel** — inline form to adjust `daily_time_budget_minutes` or `deadline_days`, re-triggers recalculation on save via `PATCH /api/student/settings`
- **PTG Warning** — if PTG > 0.20, a callout: "Your practice-to-actual gap is inflating load estimates"

#### [NEW] `client/hooks/queries/useLoadSummary.ts`

```typescript
export function useLoadSummary(userId = "usr_demo123") {
  return useQuery({
    queryKey: ["load-summary", userId],
    queryFn: () => api.get(`/api/review/load-summary?user_id=${userId}`)
                      .then(r => r.data),
    refetchInterval: 60_000,   // auto-refresh every minute
    staleTime: 30_000,
  });
}
```

#### [MODIFY] `client/components/sidebar.tsx`
Add a "Review Panel" nav item with a `BarChart2` icon from lucide-react, linking to `/review`.

---

## Why This Fits the Challenge

| Requirement | How it's met |
|---|---|
| "Limited capacity, demand, or workload" | Student's time budget (capacity) vs total prep demand (load) — directly modelled |
| "Dedicated review panel" | New `/review` route — standalone page, not embedded in dashboard |
| "Relevant information visible in one place" | All signals in one view: budget, load, per-topic breakdown, bottlenecks, deadline projection |
| "Complete user flow" | Onboarding → data exists in DB → student opens Review Panel → sees load state → adjusts budget → sees updated projections |
| "Teams free to decide implementation" | Novel `LoadCalculator` engine using existing BKT mastery + deadline + PTG data — no third party dependency |

---

## Open Questions

> [!IMPORTANT]
> **Should budget rebalancing persist to DB?**
> The "adjust daily budget" form in the panel can either (a) update `student.daily_time_budget_minutes` in the DB permanently via `PATCH /api/student/settings`, or (b) only simulate the change in the panel ("what if I study 3 hrs instead of 2?"). Which do you want?

> [!IMPORTANT]
> **Should this be a new sidebar route (`/review`) or a modal overlay accessible from the dashboard?**
> A dedicated route is cleaner and satisfies "dedicated review panel" more explicitly.

> [!NOTE]
> **`MINUTES_PER_MASTERY_UNIT = 180`** — this is a tunable constant. Current assumption: 3 hours of practice raises mastery by 10%. Adjust based on actual student data.
