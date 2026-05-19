import os
import re

directories = [
    r"c:\Users\pivan\Documents\A-UDLA_2026-1\Gestion del conocimiento\proyecto_final\fron-miVehiculo\src\views",
    r"c:\Users\pivan\Documents\A-UDLA_2026-1\Gestion del conocimiento\proyecto_final\fron-miVehiculo\src\components"
]

replacements = {
    # Dark greens to soft text / dark mint
    r"#052e16": "var(--c-text-main)",
    r"#14532d": "var(--c-primary-dark)",
    r"#166534": "var(--c-success-text)",
    
    # Primary greens to pastel primary dark
    r"#16a34a": "var(--c-primary-dark)",
    r"#15803d": "var(--c-primary-dark)",
    r"#059669": "var(--c-primary-dark)",
    r"#10b981": "var(--c-primary-dark)",
    
    # Medium greens to pastel primary / hover
    r"#4ade80": "var(--c-primary-hover)",
    r"#86efac": "var(--c-primary)",
    r"#bbf7d0": "var(--c-primary)",
    
    # Light greens to pastel light / backgrounds
    r"#dcfce7": "var(--c-primary-light)",
    r"#d1fae5": "var(--c-primary-light)",
    r"#f0fdf4": "var(--c-bg-surface-soft)",
    r"#f9fefb": "var(--c-bg-surface)",
    
    # Grays to variables
    r"#6b7280": "var(--c-text-muted)",
    r"#64748b": "var(--c-text-muted)",
    r"#94a3b8": "var(--c-text-light)",
    r"#cbd5e1": "var(--c-border-hover)",
    r"#e2e8f0": "var(--c-border)",
    r"#f1f5f9": "var(--c-bg-surface-soft)",
    r"#f8fafc": "var(--c-bg-surface-soft)",
    
    # Shadows
    r"rgba\(5, 46, 22, 0.04\)": "rgba(148, 163, 184, 0.1)",
    r"rgba\(5, 46, 22, 0.08\)": "rgba(148, 163, 184, 0.15)",
    r"rgba\(5, 46, 22, 0.1\)": "rgba(148, 163, 184, 0.15)",
    r"rgba\(5, 46, 22, 0.2\)": "rgba(148, 163, 184, 0.2)",
    
    # Specific elements
    r"linear-gradient\(135deg, var\(--c-text-main\), var\(--c-primary-dark\)\)": "linear-gradient(135deg, var(--c-primary-light), var(--c-primary))",
    r"linear-gradient\(135deg, var\(--c-text-main\) 0%, var\(--c-primary-dark\) 100%\)": "linear-gradient(135deg, var(--c-primary-light) 0%, var(--c-primary) 100%)",
}

for directory in directories:
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".vue"):
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                    
                for old, new in replacements.items():
                    content = re.sub(old, new, content, flags=re.IGNORECASE)
                    
                # Manual fixes for things that might break contrast
                content = content.replace("color: #fff;", "color: var(--c-text-main);")
                content = content.replace("color: white;", "color: var(--c-text-main);")
                
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)

print("Reemplazo de colores completado.")
