"""
Pydantic Schemas for Skill Graph DAG and Curated Resources
"""

from typing import Optional, List, Dict, Literal
from pydantic import BaseModel
from .mastery import DifficultyLevel

RoleType = Literal["WEB_DEVELOPMENT", "SDE", "MACHINE_LEARNING", "DEVOPS"]
SkillCategory = Literal[
    "LANGUAGES",
    "FRONTEND",
    "BACKEND",
    "DATABASE",
    "DATA_STRUCTURES",
    "ALGORITHMS",
    "CS_CORE",
    "SYSTEM_DESIGN",
    "DEVOPS",
    "AI_ML"
]
ResourceType = Literal[
    "DOCUMENTATION",
    "YOUTUBE_VIDEO",
    "TUTORIAL",
    "PRACTICE_SET",
    "ARTICLE",
    "COURSE"
]


class SkillNode(BaseModel):
    id: str
    name: str
    category: SkillCategory
    description: str
    prerequisites: List[str] = []
    is_core: bool = True
    weight: float = 1.0
    estimated_hours: int = 10
    difficulty_tier: Literal["BEGINNER", "INTERMEDIATE", "ADVANCED"] = "BEGINNER"


class SkillEdge(BaseModel):
    source: str
    target: str
    type: Literal["PREREQUISITE", "EXPANSION"] = "PREREQUISITE"


class CompetencyMap(BaseModel):
    role: RoleType
    display_name: str
    description: str
    version: str = "2.0.0"
    nodes: List[SkillNode]
    edges: List[SkillEdge]


class DAGValidationResult(BaseModel):
    is_valid: bool
    has_cycles: bool
    cycle_nodes: Optional[List[str]] = None
    topological_order: List[str]
    isolated_nodes: List[str]
    total_nodes: int


class RootCauseDiagnosis(BaseModel):
    failed_topic_id: str
    failed_topic_name: str
    root_cause_node_id: str
    root_cause_node_name: str
    current_mastery: float
    required_mastery: float
    causal_path: List[str]
    explanation: str
    remediation_plan: str


class CuratedResource(BaseModel):
    id: str
    topic_id: str
    title: str
    url: str
    type: ResourceType
    platform: str
    author: Optional[str] = None
    duration_minutes: Optional[int] = None
    difficulty: DifficultyLevel = "MEDIUM"
    is_verified: bool = True
    description: str
