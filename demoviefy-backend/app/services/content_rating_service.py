

DANGER_LEVEL_MAP = {
    "bottle": 2,
    "fire": 4,
    "knife": 5,
    "blood": 6,
    "gun": 6,
    "weapon": 6
}

RATING_LABELS = {
    1: "Livre",
    2: "10 anos",
    3: "12 anos",
    4: "14 anos",
    5: "16 anos",
    6: "18 anos"
}

def estimate_rating(label_counts: dict[str, int]) -> dict[str, str | int | list[str]]:
    max_level = 1
    trigger_objects = []

    for label in label_counts.keys():
        # Busca o nível do objeto; assume 1 (Livre) se não estiver mapeado
        level = DANGER_LEVEL_MAP.get(label.lower(), 1)
        
        if level > max_level:
            max_level = level
            trigger_objects = [label]
        elif level == max_level and level > 1:
            trigger_objects.append(label)

    return {
        "danger_level": max_level,
        "rating_label": RATING_LABELS[max_level],
        "trigger_objects": trigger_objects
    }