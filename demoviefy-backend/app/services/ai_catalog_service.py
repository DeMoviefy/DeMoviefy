from pathlib import Path


from pathlib import Path
from app.config.ai_settings import load_frame_ai_settings
from app.config.paths import to_repo_relative, MODEL_DIR


TASK_DIRECTORY_MAP = {
    "Object_Detection": ("object_detection", "Detecção de Objetos"),
    "Image_Classification": ("image_classification", "Classificação de Imagem"),
    "Instance_Segmentation": ("instance_segmentation", "Segmentação de Instancias"),
    "Oriented_Bounding_Boxes": ("oriented_bounding_boxes", "Caixas Orientadas"),
    "Pose_Estimation": ("pose_estimation", "Estimação de Pose"),
}


def _task_metadata(task_dir: str) -> tuple[str, str]:
    """Return a stable API key and a readable label for a model directory.

    Known folders keep their existing API keys. Any new folder placed in
    ``ai_model/model`` becomes its own selectable task automatically, instead
    of being merged into a generic ``custom`` option.
    """
    known_task = TASK_DIRECTORY_MAP.get(task_dir)
    if known_task:
        return known_task

    task_type = "_".join(
        part.lower() for part in task_dir.replace("-", "_").replace(" ", "_").split("_") if part
    )
    task_label = task_dir.replace("_", " ").replace("-", " ").title()
    return task_type or "custom", task_label or "Custom"


def _build_model_entry(path: Path) -> dict:
    task_dir = path.parent.name
    task_type, task_label = _task_metadata(task_dir)
    return {
        "id": to_repo_relative(path),
        "name": path.name,
        "task_type": task_type,
        "task_label": task_label,
        "relative_path": to_repo_relative(path),
        "absolute_path": str(path),
    }


def list_available_models() -> list[dict]:
    if not MODEL_DIR.exists():
        return []

    models = [_build_model_entry(path) for path in sorted(MODEL_DIR.rglob("*.pt"))]
    return models


def get_model_by_relative_path(relative_path: str | None) -> dict | None:
    if not relative_path:
        return None

    normalized = relative_path.replace("\\", "/").strip("/")
    for model in list_available_models():
        if model["relative_path"] == normalized:
            return model
    return None


def resolve_ai_config(task_type: str | None, model_reference: str | None) -> dict:
    """Resolve and validate AI model configuration based on user request and system defaults."""
    settings = load_frame_ai_settings()
    catalog = list_available_models()
    fallback_model = get_model_by_relative_path(to_repo_relative(Path(settings.model_path)))

    if model_reference:
        model = get_model_by_relative_path(model_reference)
        if model is None:
            raise ValueError("Modelo de IA não encontrado.")
    else:
        requested_task = task_type or settings.task_type
        model = next((entry for entry in catalog if entry["task_type"] == requested_task), fallback_model)

    if model is None:
        raise ValueError("Nenhum modelo disponível para a tarefa escolhida.")

    resolved_task = task_type or model["task_type"]
    if model["task_type"] != resolved_task:
        raise ValueError("O modelo selecionado não pertence a tarefa escolhida.")

    return {
        "task_type": resolved_task,
        "task_label": model["task_label"],
        "model_path": model["absolute_path"],
        "model_relative_path": model["relative_path"],
        "model_name": model["name"],
    }