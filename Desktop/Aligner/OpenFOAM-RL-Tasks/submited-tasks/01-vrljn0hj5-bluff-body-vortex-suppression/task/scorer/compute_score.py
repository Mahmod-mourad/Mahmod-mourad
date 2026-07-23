"""Gradual deterministic scorer for bluff-body-vortex-suppression.

# _rev: 2026-07-22.v3

The agent submits /tmp/output/vortex_control.json. The scorer validates the
splitter-plate geometry, runs bounded deterministic OpenFOAM health checks
across private hidden flow-speed cases, and scores public-guided design
alignment plus absolute robust wake-stabilization / drag-control performance.

Scoring is physics-dominant and COUPLED: the non-physics rows (file/feasibility,
public alignment, health) sum to 0.20 but only count in full when the submission
shows real physics competence, so a feasible-but-non-stabilizing design cannot
bank them as a free floor. The physics rows score how good the design actually
is -- worst-case wake-stabilization and drag control across the hidden speeds via
disclosed monotone credit curves -- rather than how close the response lands to a
hidden per-condition target value. Because the model has an interior optimum whose
best plate length shifts with channel speed, earning full worst-case credit
requires a genuine multi-speed compromise rather than a single guessable constant.
"""

from __future__ import annotations

import json
import sys
import tempfile
import time
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))
import vortex_case as vc  # noqa: E402

FIELDS = vc.FIELDS

# v2 weights: physics-dominant. The non-physics rows below (file/feasibility +
# public alignment + health) sum to 0.20 and are additionally COUPLED to physics
# competence in the aggregation (see compute_score), so a design that does not
# actually stabilize the wake cannot bank them as a free floor. Physics rows sum
# to 0.80. This kills the ~0.49 free floor the additive v1 handed to any feasible
# submission and makes the hidden multi-speed fit the load-bearing skill.
PHYSICS_KEYS = (
    "nominal_stabilization_fit",
    "nominal_drag_fit",
    "hidden_stabilization_fit",
    "hidden_drag_fit",
    "hidden_robustness_spread",
)
WEIGHTS: dict[str, float] = {
    "output_exists": 0.01,
    "json_parses": 0.01,
    "required_fields": 0.01,
    "finite_numeric": 0.01,
    "public_range_margin": 0.02,
    "public_guidance_alignment": 0.03,
    "public_transfer_alignment": 0.02,
    "derived_geometry": 0.04,
    "mesh_health": 0.02,
    "solver_health": 0.03,
    "nominal_stabilization_fit": 0.18,
    "nominal_drag_fit": 0.12,
    "hidden_stabilization_fit": 0.22,
    "hidden_drag_fit": 0.16,
    "hidden_robustness_spread": 0.12,
}

CRITERION_DESCRIPTIONS: dict[str, str] = {
    "output_exists": "Required vortex_control.json exists at the final output path",
    "json_parses": "Final design output parses as a single JSON object",
    "required_fields": "JSON contains the four required splitter design fields",
    "finite_numeric": "All submitted design values are finite numbers",
    "public_range_margin": "Continuous public-bounds margin score for length, gap, thickness, and offset fractions",
    "public_guidance_alignment": "Continuous alignment with disclosed baseline-trend and calibration-sample guidance",
    "public_transfer_alignment": "Continuous off-design plausibility against disclosed public transfer bands",
    "derived_geometry": "Continuous feasibility score from wall clearance, blockage cap, wake room, and meshability",
    "mesh_health": "Deterministic hidden OpenFOAM mesh generation succeeds across private cases",
    "solver_health": "Deterministic hidden OpenFOAM solver checks complete without divergence across private cases",
    "nominal_stabilization_fit": "Absolute wake-stabilization credit at the nominal flow condition, via a disclosed monotone credit curve",
    "nominal_drag_fit": "Absolute drag-control credit at the nominal flow condition, via a disclosed monotone credit curve",
    "hidden_stabilization_fit": "Worst-case absolute wake-stabilization credit across the hidden flow speeds",
    "hidden_drag_fit": "Worst-case absolute drag-control credit across the hidden flow speeds",
    "hidden_robustness_spread": "Robustness credit: a flat response across hidden speeds, scaled by how strongly the design actually stabilizes",
}


def _load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text())
    except Exception:
        return None


def _clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, float(x)))


def _mean(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def _load_public(private: Path) -> dict[str, Any]:
    candidates = [
        Path("/data/geometry_context.json"),
        Path.cwd() / "data/geometry_context.json",
        private.parent.parent / "data/geometry_context.json",
    ]
    for path in candidates:
        data = _load_json(path)
        if isinstance(data, dict) and "design_bounds" in data:
            return data
    raise SystemExit("could not locate public geometry_context.json")


def _load_named(private: Path, name: str, required_key: str) -> dict[str, Any]:
    candidates = [
        Path(f"/data/{name}"),
        Path.cwd() / f"data/{name}",
        private.parent.parent / f"data/{name}",
    ]
    for path in candidates:
        data = _load_json(path)
        if isinstance(data, dict) and required_key in data:
            return data
    return {}


def _load_template(private: Path) -> dict[str, Any] | None:
    candidates = [
        Path("/data/vortex_control_template.json"),
        Path.cwd() / "data/vortex_control_template.json",
        private.parent.parent / "data/vortex_control_template.json",
    ]
    for path in candidates:
        data = _load_json(path)
        if isinstance(data, dict) and all(f in data for f in FIELDS):
            return data
    return None


def _same_numeric_design(a: dict[str, Any] | None, b: dict[str, Any] | None, *, tol: float = 1e-9) -> bool:
    if not isinstance(a, dict) or not isinstance(b, dict):
        return False
    try:
        return all(abs(float(a[f]) - float(b[f])) <= tol for f in FIELDS)
    except Exception:
        return False


def _template_proximity(
    design: dict[str, Any] | None, template: dict[str, Any] | None, public: dict[str, Any]
) -> float:
    """1.0 if `design` is the unmodified schema template, decaying to 0.0 as it
    moves at least ~8% of each field's public span away on its farthest field.

    A neighborhood penalty (not an exact-match check): copy-and-nudge submissions
    that stay within a few percent of the template on every field are still caught,
    so the anti-template discount can't be escaped by a 1e-9 tweak.
    """
    if not isinstance(design, dict) or not isinstance(template, dict):
        return 0.0
    bounds = public.get("design_bounds", {})
    dists = []
    try:
        for f in FIELDS:
            span = float(bounds[f]["max"]) - float(bounds[f]["min"])
            if span <= 0:
                return 0.0
            dists.append(abs(float(design[f]) - float(template[f])) / span)
    except (KeyError, TypeError, ValueError):
        # Malformed design/bounds shape -> treat as "not a template copy" (the
        # lenient, agent-favoring result). Narrow on purpose: an unexpected
        # infra/author fault propagates instead of being swallowed into a score.
        return 0.0
    # farthest field decides: identical -> 1.0 ; >=8% of span on any field -> 0.0
    return _clamp(1.0 - max(dists) / 0.08)


def _interp_piecewise(x: float, anchors: list[list[float]]) -> float:
    if not anchors:
        return 0.0
    pts = sorted((float(a), float(b)) for a, b in anchors)
    if x <= pts[0][0]:
        return _clamp(pts[0][1])
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if x <= x1:
            if x1 == x0:
                return _clamp(y1)
            t = (x - x0) / (x1 - x0)
            return _clamp(y0 + t * (y1 - y0))
    return _clamp(pts[-1][1])


def _error_score(value: float, target: float, anchors: list[list[float]]) -> float:
    return _interp_piecewise(abs(float(value) - float(target)), anchors)


def _blended_error_score(
    value: float, target: float, tight: list[list[float]], medium: list[list[float]], broad: list[list[float]]
) -> float:
    pieces = []
    if tight:
        pieces.append((0.40, _error_score(value, target, tight)))
    if medium:
        pieces.append((0.36, _error_score(value, target, medium)))
    if broad:
        pieces.append((0.24, _error_score(value, target, broad)))
    if not pieces:
        return 0.0
    total_w = sum(w for w, _ in pieces)
    return _clamp(sum(w * s for w, s in pieces) / max(total_w, 1e-9))


def _band_score(value: float, band: list[Any] | tuple[Any, Any], lower_falloff: float, upper_falloff: float) -> float:
    if not isinstance(band, (list, tuple)) or len(band) != 2:
        return 0.0
    lo, hi = float(band[0]), float(band[1])
    value = float(value)
    if lo <= value <= hi:
        return 1.0
    if value < lo:
        return _clamp((value - (lo - max(lower_falloff, 1e-9))) / max(lower_falloff, 1e-9))
    return _clamp(((hi + max(upper_falloff, 1e-9)) - value) / max(upper_falloff, 1e-9))


def _public_guidance_alignment(geom: vc.Geometry, baseline: dict[str, Any]) -> float:
    trends = baseline.get("design_trends", {}) if isinstance(baseline, dict) else {}
    if not trends:
        return 0.5
    # Coarse, band-based translation of the disclosed qualitative trends into
    # continuous scores: a "useful" region for each parameter, per the
    # baseline_wake_summary.json narrative.
    parts = {
        "length": _band_score(geom.splitter_length_fraction, [1.3, 3.0], 0.9, 1.0),
        "gap": _band_score(geom.splitter_gap_fraction, [0.05, 0.55], 0.15, 0.45),
        "thickness": _band_score(geom.splitter_thickness_fraction, [0.03, 0.08], 0.02, 0.09),
        "offset": _band_score(geom.splitter_offset_fraction, [-0.15, 0.15], 0.25, 0.25),
    }
    return _clamp(_mean(list(parts.values())))


def _public_transfer_alignment(geom: vc.Geometry, transfer: dict[str, Any]) -> float:
    cases = transfer.get("public_offdesign_cases", []) if isinstance(transfer, dict) else []
    bands = transfer.get("broad_performance_bands", {}) if isinstance(transfer, dict) else {}
    if not cases or not bands:
        return 0.0
    stab_band = bands.get("wake_stabilization_index", {})
    drag_band = bands.get("drag_ratio_to_baseline", {})
    scores = []
    for case in cases:
        if not isinstance(case, dict):
            continue
        metrics = vc.response_metrics(
            geom, {"channel_flow_speed_m_per_s": float(case.get("channel_flow_speed_m_per_s", 0.113))}
        )
        stab_score = _band_score(
            metrics["wake_stabilization_index"],
            [stab_band.get("useful_min", 0.55), stab_band.get("useful_max", 1.0)],
            float(stab_band.get("lower_falloff", 0.2)),
            float(stab_band.get("upper_falloff", 0.05)),
        )
        drag_score = _band_score(
            metrics["drag_ratio_to_baseline"],
            [drag_band.get("preferred_min", 0.55), drag_band.get("soft_cap", 1.15)],
            float(drag_band.get("lower_falloff", 0.15)),
            float(drag_band.get("upper_falloff", 0.20)),
        )
        scores.append(_mean([stab_score, drag_score]))
    return _clamp(_mean(scores))


def _measurement_adjusted_score(raw_score: float, *, mesh_ok: bool, solver_ok: bool) -> float:
    raw_score = _clamp(raw_score)
    if solver_ok:
        return raw_score
    if mesh_ok:
        return min(raw_score * 0.5, 0.5)
    return min(raw_score * 0.15, 0.15)


def _weighted(subscores: dict[str, float]) -> float:
    return _clamp(sum(WEIGHTS[k] * _clamp(subscores.get(k, 0.0)) for k in WEIGHTS))


def _payload(subscores: dict[str, float], metadata: dict[str, Any]) -> dict[str, Any]:
    score = _clamp(float(metadata.get("reported_final_score", _weighted(subscores))))
    metadata = {**metadata, "criterion_descriptions": dict(CRITERION_DESCRIPTIONS)}
    return {
        "score": score,
        "subscores": subscores,
        "weights": dict(WEIGHTS),
        "scoring_mode": "weighted",
        "metadata": metadata,
    }


def compute_score(workspace: Path, trajectory: Any, private: Path) -> dict[str, Any]:
    private = Path(private)
    expected = _load_json(private / "expected.json") or {}
    conditions = _load_json(private / "hidden_conditions.json") or {}
    public = _load_public(private)
    baseline = _load_named(private, "baseline_wake_summary.json", "design_trends")
    transfer = _load_named(private, "public_transfer_guidance.json", "public_offdesign_cases")
    template = _load_template(private)

    output_path = Path(workspace) / "vortex_control.json"
    output_exists = output_path.exists()
    metadata: dict[str, Any] = {
        "output_path": str(output_path),
        "scoring_design": "v3 bluff-body-vortex-suppression scoring: physics-dominant coupled aggregation (non-physics floor scaled by physics competence) over ABSOLUTE robust-performance credit -- worst-case wake-stabilization and drag control across hidden speeds via disclosed monotone credit curves, plus a flat-and-strong robustness term and solver-backed case health. The grader scores how good the submitted design actually is; it does not compare the response to any hidden per-condition target value.",
    }

    design = _load_json(output_path) if output_exists else None
    json_parses = isinstance(design, dict)
    metadata["submitted_design"] = design if json_parses else None
    template_proximity = _template_proximity(design, template, public) if json_parses else 0.0
    is_template_copy = template_proximity > 0.0
    metadata["public_template_copy"] = bool(_same_numeric_design(design, template)) if json_parses else False
    metadata["template_proximity"] = round(template_proximity, 4)

    subscores: dict[str, float] = {key: 0.0 for key in WEIGHTS}
    subscores["output_exists"] = 1.0 if output_exists else 0.0
    subscores["json_parses"] = 1.0 if json_parses else 0.0

    if not json_parses:
        metadata["failure_reason"] = "missing or invalid vortex_control.json"
        return _payload(subscores, metadata)

    feasibility, errors, geom = vc.feasibility_scores(design, public)
    subscores["required_fields"] = feasibility["required_fields"]
    subscores["finite_numeric"] = feasibility["finite_numeric"]
    subscores["public_range_margin"] = feasibility["public_ranges"]
    subscores["derived_geometry"] = feasibility["derived_geometry"]
    metadata["feasibility_errors"] = errors

    if geom is None or subscores["finite_numeric"] < 1.0 or subscores["public_range_margin"] < 0.20:
        metadata["failure_reason"] = "design not sufficiently feasible to build deterministic OpenFOAM cases"
        return _payload(subscores, metadata)

    guidance_alignment = _public_guidance_alignment(geom, baseline)
    transfer_alignment = _public_transfer_alignment(geom, transfer)
    subscores["public_guidance_alignment"] = guidance_alignment
    subscores["public_transfer_alignment"] = transfer_alignment
    metadata["public_guidance_alignment"] = round(guidance_alignment, 6)
    metadata["public_transfer_alignment"] = round(transfer_alignment, 6)

    of_settings = conditions.get("openfoam", {}) or {}
    cases = list(conditions.get("cases", []) or [])
    per_case_timeout = int(of_settings.get("per_case_timeout_sec", 95))
    block_timeout = int(of_settings.get("block_mesh_timeout_sec", 28))
    solver_timeout = int(of_settings.get("pimple_foam_timeout_sec", 62))
    total_timeout = float(of_settings.get("total_timeout_sec", 500))
    deadline = time.monotonic() + max(30.0, total_timeout)
    iterations = int(of_settings.get("iterations", 60))
    delta_t = float(of_settings.get("delta_t_s", 0.002))

    # Absolute-performance credit curves (monotone maps from a computed physics
    # quantity to [0,1]); calibrated so the robust-optimal design earns full credit.
    # These are NOT hidden per-condition response targets -- the grader scores how
    # good the submitted design actually is, not how close it lands to a hidden value.
    stab_curve = expected.get("stabilization_credit_curve", []) or []
    drag_curve = expected.get("drag_credit_curve", []) or []
    spread_curve = expected.get("spread_credit_curve", []) or []

    per_case: dict[str, dict[str, Any]] = {}
    for case in cases:
        case_name = str(case.get("name", f"case_{len(per_case)}"))
        case = dict(case)
        case.setdefault("iterations", iterations)
        case.setdefault("delta_t_s", delta_t)
        with tempfile.TemporaryDirectory() as tmp:
            try:
                remaining = max(1.0, deadline - time.monotonic())
                if remaining <= 8.0:
                    raise TimeoutError("global OpenFOAM scoring budget exhausted before this case")
                case_timeout = min(per_case_timeout, max(1, int(remaining - 5.0)))
                result = vc.build_and_run(
                    Path(tmp),
                    design,
                    public,
                    case,
                    timeout=case_timeout,
                    block_timeout=min(block_timeout, case_timeout),
                    solver_timeout=min(solver_timeout, max(1, case_timeout - min(block_timeout, case_timeout))),
                )
            except Exception as exc:  # noqa: BLE001 - verifier must degrade gracefully, not crash
                fallback = vc.response_metrics(geom, case) if geom is not None else {}
                result = vc.CaseResult(
                    ok=False,
                    mesh_ok=False,
                    solver_ok=False,
                    wake_stabilization_index=float(fallback.get("wake_stabilization_index", 0.0)),
                    drag_ratio_to_baseline=float(fallback.get("drag_ratio_to_baseline", 1.6)),
                    blockage_fraction=float(fallback.get("blockage_fraction", 1.0)),
                    reason=f"case helper exception: {exc}",
                )
        stab_raw = _interp_piecewise(result.wake_stabilization_index, stab_curve)
        drag_raw = _interp_piecewise(result.drag_ratio_to_baseline, drag_curve)
        stab_score = _measurement_adjusted_score(stab_raw, mesh_ok=result.mesh_ok, solver_ok=result.solver_ok)
        drag_score = _measurement_adjusted_score(drag_raw, mesh_ok=result.mesh_ok, solver_ok=result.solver_ok)
        per_case[case_name] = {
            "ok": bool(result.ok),
            "mesh_ok": bool(result.mesh_ok),
            "solver_ok": bool(result.solver_ok),
            "wake_stabilization_index": result.wake_stabilization_index,
            "drag_ratio_to_baseline": result.drag_ratio_to_baseline,
            "stabilization_score": stab_score,
            "drag_score": drag_score,
            "reason": result.reason[-240:],
        }

    metadata["case_results"] = per_case
    if not per_case:
        metadata["failure_reason"] = "no hidden cases configured"
        return _payload(subscores, metadata)

    rows = list(per_case.values())
    subscores["mesh_health"] = _mean([1.0 if r["mesh_ok"] else 0.0 for r in rows])
    subscores["solver_health"] = _mean([1.0 if r["solver_ok"] else 0.0 for r in rows])

    nominal_row = per_case.get("nominal", rows[0])
    subscores["nominal_stabilization_fit"] = float(nominal_row["stabilization_score"])
    subscores["nominal_drag_fit"] = float(nominal_row["drag_score"])

    off_design_rows = [row for name, row in per_case.items() if name != "nominal"] or rows
    subscores["hidden_stabilization_fit"] = min(float(r["stabilization_score"]) for r in off_design_rows)
    subscores["hidden_drag_fit"] = min(float(r["drag_score"]) for r in off_design_rows)

    stabs = [float(r["wake_stabilization_index"]) for r in rows]
    drags = [float(r["drag_ratio_to_baseline"]) for r in rows]
    stab_spread = max(stabs) - min(stabs)
    drag_spread = max(drags) - min(drags)
    # Robustness rewards a response that is BOTH flat and strong across the hidden
    # speeds: the spread credit (smaller spread -> more credit) is scaled by how well
    # the design actually stabilizes on average, so a uniformly weak plate (tiny spread,
    # low stabilization) cannot bank robustness credit as a free floor.
    mean_stab_credit = _mean([float(r["stabilization_score"]) for r in rows])
    spread_credit = _interp_piecewise(stab_spread, spread_curve)
    subscores["hidden_robustness_spread"] = _clamp(spread_credit * mean_stab_credit)
    metadata["robustness_spreads"] = {
        "wake_stabilization_index": round(stab_spread, 6),
        "drag_ratio_to_baseline": round(drag_spread, 6),
    }

    if template_proximity > 0.0:
        # Neighborhood discount: physics credit is pulled toward ~0.03 in proportion
        # to how close the submission sits to the unmodified template, so a copy or a
        # copy-and-nudge cannot bank physics credit for a design it did not reason about.
        for key in PHYSICS_KEYS:
            capped = min(subscores[key], 0.05)
            subscores[key] = (1.0 - template_proximity) * subscores[key] + template_proximity * min(capped, 0.03)
        metadata["template_copy_policy"] = (
            "submission near the disclosed schema template; physics credit discounted "
            f"toward the file/feasibility floor (proximity={round(template_proximity, 4)})"
        )

    # Coupled aggregation: the non-physics rows (file/feasibility + public alignment +
    # health) only count in full when the submission shows real physics competence, so
    # a feasible-but-non-stabilizing design cannot collect them as a free floor.
    physics_weight = sum(WEIGHTS[k] for k in PHYSICS_KEYS)
    physics_earned = sum(WEIGHTS[k] * _clamp(subscores.get(k, 0.0)) for k in PHYSICS_KEYS)
    physics_fit = physics_earned / max(physics_weight, 1e-9)
    floor_earned = sum(
        WEIGHTS[k] * _clamp(subscores.get(k, 0.0)) for k in WEIGHTS if k not in PHYSICS_KEYS
    )
    coupling = 0.35 + 0.65 * physics_fit
    headline = _clamp(floor_earned * coupling + physics_earned)
    metadata["physics_fit"] = round(physics_fit, 6)
    metadata["floor_coupling"] = round(coupling, 6)
    if headline >= 0.995:
        metadata["numerical_full_credit_rounding_applied"] = True
        headline = 1.0
    else:
        metadata["numerical_full_credit_rounding_applied"] = False

    metadata["reported_final_score"] = round(float(headline), 6)
    metadata["weight_sum"] = sum(WEIGHTS.values())
    metadata["cfd_fallback_policy"] = "Physics fit scores are reduced when hidden blockMesh or pimpleFoam fail; hidden case health is separately verified."
    return _payload(subscores, metadata)
