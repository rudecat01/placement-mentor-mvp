"use client";

import { useState } from "react";
import { ReactFlow, Background, Edge, Node, NodeProps, Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { 
  ZoomIn, ZoomOut, Maximize, CheckCircle, TrendingUp, AlertTriangle, 
  Lock, X, Mic, Lightbulb, ArrowUp, ArrowDown, 
  BrainCircuit, BookOpen 
} from "lucide-react";
import { useSkillGraph } from "../../../hooks/queries/useSkillGraph";
import { useStudent } from "../../../hooks/queries/useStudent";
import { useRouter } from "next/navigation";

// --- Custom Nodes ---

type SkillNodeData = {
  title: string;
  status: "success" | "stable" | "warning" | "locked";
  mastery: number;
  ptg: number | null;
  locked?: boolean;
};

const SkillNode = ({ data, selected }: NodeProps) => {
  const { title, status, mastery, ptg, locked } = data as unknown as SkillNodeData;
  
  let ringClass = "";
  let borderClass = "";
  let icon = null;
  let progressColor = "";
  const masteryNum = Number(mastery) || 0;
  const width = Math.round(masteryNum * 100) + "%";

  if (locked) {
    borderClass = "border-border-subtle";
    icon = <Lock className="text-outline w-4 h-4" />;
    progressColor = "bg-outline";
  } else if (status === "success") {
    borderClass = "border-status-success";
    ringClass = selected ? "ring-4 ring-status-success/20" : "";
    icon = <CheckCircle className="text-status-success w-4 h-4" />;
    progressColor = "bg-status-success";
  } else if (status === "stable") {
    borderClass = "border-blue-team";
    ringClass = selected ? "ring-4 ring-blue-team/20" : "";
    icon = <TrendingUp className="text-blue-team w-4 h-4" />;
    progressColor = "bg-blue-team";
  } else if (status === "warning") {
    borderClass = "border-status-warning";
    ringClass = selected ? "ring-4 ring-status-warning/20" : "";
    icon = <AlertTriangle className="text-status-warning w-4 h-4" />;
    progressColor = "bg-status-warning";
  }

  return (
    <div className={`w-52 bg-surface border-2 rounded-lg p-3 shadow-sm cursor-pointer ${borderClass} ${ringClass} ${locked ? "opacity-70" : ""}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary/50 border-none" />
      <div className="flex justify-between items-start mb-2">
        <span className={`font-label-md text-[13px] line-clamp-1 ${locked ? "font-medium text-secondary" : "font-bold text-on-surface"}`}>{title}</span>
        {icon}
      </div>
      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mb-1">
        <div className={`${progressColor} h-full transition-all`} style={{ width }}></div>
      </div>
      <div className="flex justify-between text-[11px] text-secondary font-label-sm">
        {locked ? (
          <span>Prereq needed</span>
        ) : (
          <>
            <span>M: {Math.round(masteryNum * 100)}%</span>
            <span className={status === "warning" && ptg !== null ? "text-status-error font-bold" : ""}>
              PTG: {ptg !== null && ptg !== undefined ? `${Math.round(Number(ptg) * 100)}%` : "Locked"}
            </span>
          </>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary/50 border-none" />
    </div>
  );
};

const nodeTypes = {
  skill: SkillNode,
};

export default function SkillGraphPage() {
  const router = useRouter();
  const { data: graph, isLoading } = useSkillGraph();
  const { data: student } = useStudent();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  if (isLoading) {
    return <div className="p-24 text-center">Loading Live Skill Graph...</div>;
  }

  const isCalibrated = Boolean(student?.isCalibrated);
  const NEETCODE_POSITIONS: Record<string, {x: number, y: number}> = {
    "Arrays & Hashing": { x: 500, y: 50 },
    "Two Pointers": { x: 350, y: 200 },
    "Stack": { x: 650, y: 200 },
    "Binary Search": { x: 150, y: 350 },
    "Sliding Window": { x: 350, y: 350 },
    "Linked List": { x: 550, y: 350 },
    "Trees": { x: 350, y: 500 },
    "Tries": { x: 150, y: 650 },
    "Heap / Priority Queue": { x: 350, y: 650 },
    "Backtracking": { x: 650, y: 650 },
    "Intervals": { x: 50, y: 800 },
    "Greedy": { x: 250, y: 800 },
    "Advanced Graphs": { x: 450, y: 800 },
    "Graphs": { x: 650, y: 800 },
    "1-D Dynamic Programming": { x: 950, y: 800 },
    "2-D Dynamic Programming": { x: 750, y: 950 },
    "Bit Manipulation": { x: 950, y: 950 },
    "Math & Geometry": { x: 850, y: 1100 }
  };

  // Map backend DAG to React Flow Nodes
  const nodes: Node[] = graph?.nodes.map((n, i) => ({
    id: n.id,
    type: "skill",
    position: NEETCODE_POSITIONS[n.id] || { x: (i % 3) * 260 + 80, y: Math.floor(i / 3) * 160 + 80 },
    data: { 
      title: n.label, 
      status: n.currentMastery >= 0.70 ? "success" : n.currentMastery >= 0.50 ? "stable" : "warning", 
      mastery: n.currentMastery, 
      ptg: isCalibrated ? (n.ptg ?? 0) : null,
      locked: n.currentMastery === 0
    }
  })) || [];

  // Map backend DAG to React Flow Edges
  const edges: Edge[] = graph?.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: true,
    style: { stroke: "#94a3b8", strokeWidth: 2 }
  })) || [];

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  };

  const activeSelectedId = selectedNode || graph?.nodes[0]?.id;
  const selectedNodeData = graph?.nodes.find((n) => n.id === activeSelectedId);

  // Find prerequisites and unlocks for the active node
  const prerequisites = graph?.edges
    .filter((e) => e.target === activeSelectedId)
    .map((e) => graph.nodes.find((n) => n.id === e.source))
    .filter(Boolean);

  const unlocks = graph?.edges
    .filter((e) => e.source === activeSelectedId)
    .map((e) => graph.nodes.find((n) => n.id === e.target))
    .filter(Boolean);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Main Canvas Area */}
      <div className="flex-1 bg-surface-container-lowest relative overflow-hidden" id="graph-container">
        {/* Toolbar Overlay */}
        <div className="absolute top-4 left-4 z-10 flex space-x-2">
          <div className="bg-surface border border-border-subtle rounded-lg shadow-sm flex p-1">
            <button className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container-low rounded transition-colors" title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container-low rounded transition-colors" title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-px bg-border-subtle mx-1 my-1"></div>
            <button className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container-low rounded transition-colors" title="Fit to Screen">
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Graph Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-surface border border-border-subtle rounded-lg shadow-sm p-3">
          <h4 className="font-label-sm text-[12px] text-secondary uppercase mb-2 font-bold">Live Mastery Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-status-success mr-2 ring-2 ring-status-success/20"></div>
              <span className="font-body-sm text-[13px]">Mastered (≥70%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-team mr-2"></div>
              <span className="font-body-sm text-[13px]">Stable (50% - 70%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-status-warning mr-2 border border-status-warning"></div>
              <span className="font-body-sm text-[13px]">At Risk (&lt;50%)</span>
            </div>
          </div>
        </div>

        {/* React Flow Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          className="bg-page"
        >
          <Background color="#cbd5e1" gap={24} size={1} />
        </ReactFlow>
      </div>

      {/* Detail Panel (Right Sidebar) */}
      {selectedNodeData && (
        <div className="w-96 bg-surface border-l border-border-subtle flex flex-col h-full shadow-[-4px_0_12px_rgba(0,0,0,0.02)] z-30">
          {/* Panel Header */}
          <div className="p-6 border-b border-border-subtle bg-surface-bright">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 border rounded font-label-sm text-[10px] uppercase tracking-wider font-bold ${
                  selectedNodeData.currentMastery >= 0.70 ? "bg-status-success/10 text-status-success border-status-success/20" :
                  selectedNodeData.currentMastery >= 0.50 ? "bg-blue-team/10 text-blue-team border-blue-team/20" :
                  "bg-status-warning/10 text-status-warning border-status-warning/20"
                }`}>
                  {selectedNodeData.currentMastery >= 0.70 ? "Mastered" : selectedNodeData.currentMastery >= 0.50 ? "Stable" : "At Risk"}
                </span>
                <span className="font-label-sm text-secondary text-[12px]">{selectedNodeData.track || "DSA Core"}</span>
              </div>
              <button className="text-secondary hover:text-primary transition-colors p-1 rounded hover:bg-surface-container" onClick={() => setSelectedNode(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <h2 className="font-headline-md text-[22px] font-bold text-on-surface">{selectedNodeData.label}</h2>
            <p className="font-body-sm text-[13px] text-secondary mt-1">Dynamic telemetry extracted from your profile & diagnostics.</p>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Core Metrics Bento */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-3.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-sm text-secondary uppercase text-[11px] font-bold">Mastery</span>
                  <TrendingUp className="text-primary w-4 h-4" />
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="font-display-lg text-[28px] font-bold text-on-surface">{Math.round(selectedNodeData.currentMastery * 100)}%</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 mt-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: `${Math.round(selectedNodeData.currentMastery * 100)}%` }}></div>
                </div>
              </div>
              <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-3.5 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-sm text-secondary uppercase text-[11px] font-bold flex items-center gap-1">PTG Gap</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="font-display-lg text-[28px] font-bold text-status-error">{Math.round((selectedNodeData.ptg || 0.25) * 100)}%</span>
                </div>
                <p className="text-[11px] text-secondary mt-1 font-label-sm">Transfer Gap</p>
              </div>
            </div>

            {/* Practice vs Interview (PTG Breakdown) */}
            <div>
              <h3 className="font-label-md text-[13px] font-bold mb-3 text-on-surface uppercase tracking-wider">Performance Evidence</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between font-body-sm text-[13px] mb-1">
                    <span className="text-secondary">Practice Score (Low Pressure)</span>
                    <span className="font-medium font-mono">{Math.round((selectedNodeData.practiceScore || 0.75) * 100)}%</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${Math.round((selectedNodeData.practiceScore || 0.75) * 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-body-sm text-[13px] mb-1">
                    <span className="text-secondary flex items-center"><Mic className="w-3.5 h-3.5 mr-1" /> Interview Score (Timed)</span>
                    <span className="font-medium font-mono text-status-warning">{Math.round((selectedNodeData.interviewScore || 0.50) * 100)}%</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                    <div className="bg-tertiary-fixed-dim h-full" style={{ width: `${Math.round((selectedNodeData.interviewScore || 0.50) * 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Dynamic Red Team Insight */}
              <div className="mt-4 p-3.5 bg-primary/5 border border-primary/20 rounded-lg flex items-start space-x-3">
                <Lightbulb className="text-primary mt-0.5 w-4 h-4 shrink-0" />
                <div>
                  <span className="font-label-md text-[13px] text-primary font-bold block mb-1">Red Team Placement Insight</span>
                  <p className="text-[12px] text-on-surface-variant leading-relaxed">{selectedNodeData.redTeamInsight}</p>
                </div>
              </div>
            </div>

            {/* Dynamic Graph Dependencies */}
            <div>
              <h3 className="font-label-md text-[13px] font-bold mb-3 text-on-surface uppercase tracking-wider">DAG Relationships</h3>
              <div className="space-y-2">
                {prerequisites && prerequisites.length > 0 ? (
                  prerequisites.map((p) => p && (
                    <div key={p.id} onClick={() => setSelectedNode(p.id)} className="flex items-center space-x-3 text-[13px] p-2.5 bg-surface-container-lowest border border-border-subtle rounded-lg hover:border-primary cursor-pointer transition-colors">
                      <ArrowUp className="text-status-success w-4 h-4 shrink-0" />
                      <div>
                        <span className="block text-[11px] text-secondary font-label-sm">Prerequisite</span>
                        <span className="font-medium text-on-surface">{p.label} ({Math.round(p.currentMastery * 100)}%)</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[12px] text-secondary p-2 bg-surface-container-lowest rounded">Foundational Root Node (No prerequisites required)</div>
                )}

                {unlocks && unlocks.length > 0 ? (
                  unlocks.map((u) => u && (
                    <div key={u.id} onClick={() => setSelectedNode(u.id)} className="flex items-center space-x-3 text-[13px] p-2.5 bg-surface-container-lowest border border-border-subtle rounded-lg hover:border-primary cursor-pointer transition-colors">
                      <ArrowDown className="text-primary w-4 h-4 shrink-0" />
                      <div>
                        <span className="block text-[11px] text-secondary font-label-sm">Unlocks Next</span>
                        <span className="font-medium text-on-surface">{u.label} ({Math.round(u.currentMastery * 100)}%)</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[12px] text-secondary p-2 bg-surface-container-lowest rounded">Terminal Milestone Node</div>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-5 border-t border-border-subtle bg-surface">
            <button 
              onClick={() => router.push(`/practice/${selectedNodeData.id}`)}
              className="w-full bg-primary hover:bg-primary/90 text-on-primary py-2.5 rounded-lg font-label-md text-[14px] font-medium transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Practice {selectedNodeData.label}</span>
            </button>
            <button 
              onClick={() => router.push("/roadmap")}
              className="w-full mt-2 bg-surface hover:bg-surface-container-low border border-border-subtle text-on-surface py-2 rounded-lg font-label-md text-[13px] font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>View In Roadmap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
