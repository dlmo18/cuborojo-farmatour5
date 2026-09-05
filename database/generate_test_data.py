#!/usr/bin/env python3
"""
Generate comprehensive test data for Farmatour5 database
Ensures proper column names, UUIDs, and foreign key relationships
"""

from uuid import uuid4
from datetime import datetime

def gen_uuid(prefix):
    """Generate UUID with test prefix"""
    return f"{prefix}-{'0000-0000-0000-000000000000'[len(prefix):]}"

def sql_escape(s):
    """Escape string for SQL"""
    return s.replace("'", "''")

def generate_sql():
    sql = []
    sql.append("-- ============================================================")
    sql.append("-- FARMATOUR5 - Datos de Prueba Completos v3.0")
    sql.append("-- Generado automáticamente con columnas correctas")
    sql.append("-- ============================================================\n")
    
    # PHASE 1: Clean old test data
    sql.append("-- FASE 1: LIMPIAR DATOS ANTERIORES")
    sql.append("BEGIN;\n")
    
    # Delete in reverse dependency order
    sql.append("-- Participant answers")
    sql.append("DELETE FROM participant_answers WHERE question_id IN (")
    sql.append("  SELECT id FROM questions WHERE mission_id IN (")
    sql.append("    SELECT id FROM missions WHERE level_id IN (")
    sql.append("      SELECT id FROM levels WHERE world_id IN (")
    sql.append("        SELECT id FROM worlds WHERE id::text LIKE '1000%'")
    sql.append("      ))))")
    sql.append(";")
    sql.append("")
    
    sql.append("-- Answer options")
    sql.append("DELETE FROM answer_options WHERE question_id IN (")
    sql.append("  SELECT id FROM questions WHERE mission_id IN (")
    sql.append("    SELECT id FROM missions WHERE level_id IN (")
    sql.append("      SELECT id FROM levels WHERE world_id IN (")
    sql.append("        SELECT id FROM worlds WHERE id::text LIKE '1000%'")
    sql.append("      ))))")
    sql.append(";")
    sql.append("")
    
    sql.append("-- Golden level answer options")
    sql.append("DELETE FROM golden_level_answer_options WHERE question_id IN (")
    sql.append("  SELECT id FROM golden_level_questions WHERE level_id IN (")
    sql.append("    SELECT id FROM levels WHERE world_id IN (")
    sql.append("      SELECT id FROM worlds WHERE id::text LIKE '1000%'"))
    sql.append("    )))")
    sql.append(";")
    
    sql.append("-- Final level answer options")
    sql.append("DELETE FROM final_level_answer_options WHERE question_id IN (")
    sql.append("  SELECT id FROM final_level_questions WHERE level_id IN (")
    sql.append("    SELECT id FROM levels WHERE world_id IN (")
    sql.append("      SELECT id FROM worlds WHERE id::text LIKE '1000%'"))
    sql.append("    )))")
    sql.append(";")
    
    sql.append("-- Questions")
    sql.append("DELETE FROM questions WHERE mission_id IN (")
    sql.append("  SELECT id FROM missions WHERE level_id IN (")
    sql.append("    SELECT id FROM levels WHERE world_id IN (")
    sql.append("      SELECT id FROM worlds WHERE id::text LIKE '1000%'"))
    sql.append("    )))")
    sql.append(";")
    
    sql.append("-- Golden level questions")
    sql.append("DELETE FROM golden_level_questions WHERE level_id IN (")
    sql.append("  SELECT id FROM levels WHERE world_id IN (")
    sql.append("    SELECT id FROM worlds WHERE id::text LIKE '1000%'")
    sql.append("  ))")
    sql.append(";")
    
    sql.append("-- Final level questions")
    sql.append("DELETE FROM final_level_questions WHERE level_id IN (")
    sql.append("  SELECT id FROM levels WHERE world_id IN (")
    sql.append("    SELECT id FROM worlds WHERE id::text LIKE '1000%'")
    sql.append("  ))")
    sql.append(";")
    
    sql.append("-- Mission items")
    sql.append("DELETE FROM mission_items WHERE mission_id IN (")
    sql.append("  SELECT id FROM missions WHERE level_id IN (")
    sql.append("    SELECT id FROM levels WHERE world_id IN (")
    sql.append("      SELECT id FROM worlds WHERE id::text LIKE '1000%'"))
    sql.append("    )))")
    sql.append(";")
    
    sql.append("-- Golden level items")
    sql.append("DELETE FROM golden_level_items WHERE level_id IN (")
    sql.append("  SELECT id FROM levels WHERE world_id IN (")
    sql.append("    SELECT id FROM worlds WHERE id::text LIKE '1000%'")
    sql.append("  ))")
    sql.append(";")
    
    sql.append("-- Missions")
    sql.append("DELETE FROM missions WHERE level_id IN (")
    sql.append("  SELECT id FROM levels WHERE world_id IN (")
    sql.append("    SELECT id FROM worlds WHERE id::text LIKE '1000%'")
    sql.append("  ))")
    sql.append(";")
    
    sql.append("-- Levels")
    sql.append("DELETE FROM levels WHERE world_id IN (")
    sql.append("  SELECT id FROM worlds WHERE id::text LIKE '1000%'")
    sql.append(")")
    sql.append(";")
    
    sql.append("-- Worlds")
    sql.append("DELETE FROM worlds WHERE id::text LIKE '1000%';")
    sql.append("DELETE FROM media_library WHERE id::text LIKE '7000%';")
    sql.append("DELETE FROM groups WHERE id::text LIKE '8000%';")
    
    sql.append("\n-- FASE 2: INSERTAR DATOS\n")
    
    # Media library
    media = [
        ('70000001', 'abriflu.jpg', 'image', '/media/abriflu.jpg', 102400, 'image/jpeg'),
        ('70000002', 'clorfex.jpg', 'image', '/media/clorfex.jpg', 98400, 'image/jpeg'),
        ('70000003', 'actron.jpg', 'image', '/media/actron.jpg', 105000, 'image/jpeg'),
        ('70000004', 'coricidin.jpg', 'image', '/media/coricidin.jpg', 99800, 'image/jpeg'),
        ('70000005', 'tafirol.jpg', 'image', '/media/tafirol.jpg', 101200, 'image/jpeg'),
        ('70000006', 'aspirin.jpg', 'image', '/media/aspirin.jpg', 97600, 'image/jpeg'),
        ('70000007', 'ibupirac.jpg', 'image', '/media/ibupirac.jpg', 103400, 'image/jpeg'),
        ('70000008', 'voltaren.jpg', 'image', '/media/voltaren.jpg', 100800, 'image/jpeg'),
        ('70000009', 'intro_video.mp4', 'video', '/media/intro_video.mp4', 5242880, 'video/mp4'),
        ('70000010', 'tutorial_video.mp4', 'video', '/media/tutorial_video.mp4', 3145728, 'video/mp4'),
    ]
    
    sql.append("INSERT INTO media_library (id, name, type, url, file_size, mime_type, created_at) VALUES")
    for i, (id_, name, type_, url, size, mime) in enumerate(media):
        comma = "," if i < len(media) - 1 else ""
        sql.append(f"  ('{id_}', '{name}', '{type_}', '{url}', {size}, '{mime}', NOW()){comma}")
    sql.append(";")
    
    # Groups
    sql.append("\nINSERT INTO groups (id, name, description, is_active) VALUES")
    sql.append("  ('80000001', 'Test Group', 'Grupo de prueba', true);")
    
    # Worlds
    sql.append("\nINSERT INTO worlds (id, name, description, order_num, is_active) VALUES")
    worlds = [
        ('10000001', 'Mundo de la Farmacología', 'Explora el mundo de los medicamentos', 1),
        ('10000002', 'Mundo de la Microbiología', 'Descubre el mundo de los microbios', 2),
        ('10000003', 'Mundo de la Toxicología', 'Entérate de los efectos tóxicos', 3),
        ('10000004', 'Mundo de la Farmacocinética', 'Aprende cómo se mueven los fármacos', 4),
    ]
    for i, (id_, name, desc, order) in enumerate(worlds):
        comma = "," if i < len(worlds) - 1 else ""
        sql.append(f"  ('{id_}', '{sql_escape(name)}', '{sql_escape(desc)}', {order}, true){comma}")
    sql.append(";")
    
    # Levels (5 per world: 3 normal + 1 golden + 1 final)
    sql.append("\nINSERT INTO levels (id, world_id, name, description, order_num, level_type, max_stars, is_active) VALUES")
    level_counter = 0
    level_values = []
    for world_idx, (world_id, _, _, _) in enumerate(worlds):
        for level_in_world in range(5):
            level_counter += 1
            level_id = f"2000{world_idx:02d}{level_in_world:02d}"
            
            if level_in_world < 3:
                level_type = 'normal'
                level_name = f"Nivel {level_in_world + 1}"
            elif level_in_world == 3:
                level_type = 'golden'
                level_name = "Nivel Dorado"
            else:
                level_type = 'final'
                level_name = "Nivel Final"
            
            comma = "," if level_counter < 20 else ""
            level_values.append(f"  ('{level_id}', '{world_id}', '{level_name}', 'Descripción del nivel', {level_in_world + 1}, '{level_type}', 3, true){comma}")
    
    sql.extend(level_values)
    sql.append(";")
    
    # Missions (3 per normal level)
    sql.append("\nINSERT INTO missions (id, level_id, name, description, order_num, max_stars, is_active) VALUES")
    mission_counter = 0
    mission_values = []
    for world_idx in range(4):
        for level_in_world in range(3):  # Only normal levels have missions
            level_id = f"2000{world_idx:02d}{level_in_world:02d}"
            for mission_in_level in range(3):
                mission_counter += 1
                mission_id = f"3000{mission_counter:04d}"
                comma = "," if mission_counter < 36 else ""
                mission_values.append(f"  ('{mission_id}', '{level_id}', 'Misión {mission_in_level + 1}', 'Completa esta misión', {mission_in_level + 1}, 1, true){comma}")
    
    sql.extend(mission_values)
    sql.append(";")
    
    # Mission items (3 per mission)
    sql.append("\nINSERT INTO mission_items (id, mission_id, title, detail, benefits, order_num, is_active) VALUES")
    item_counter = 0
    item_values = []
    for mission_in_all in range(36):
        mission_id = f"3000{mission_in_all + 1:04d}"
        for item_in_mission in range(3):
            item_counter += 1
            item_id = f"4000{item_counter:04d}"
            comma = "," if item_counter < 108 else ""
            item_values.append(f"  ('{item_id}', '{mission_id}', 'Item {item_in_mission + 1}', 'Detalle del item', 'Beneficios del item', {item_in_mission + 1}, true){comma}")
    
    sql.extend(item_values)
    sql.append(";")
    
    # Questions (3 per mission)
    sql.append("\nINSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active) VALUES")
    question_counter = 0
    question_values = []
    for mission_in_all in range(36):
        mission_id = f"3000{mission_in_all + 1:04d}"
        for q_in_mission in range(3):
            question_counter += 1
            question_id = f"5000{question_counter:04d}"
            image_id = f"7000{(q_in_mission % 10) + 1:04d}"
            comma = "," if question_counter < 108 else ""
            question_values.append(f"  ('{question_id}', '{mission_id}', 'Pregunta {q_in_mission + 1}?', '{image_id}', {q_in_mission + 1}, 1, true){comma}")
    
    sql.extend(question_values)
    sql.append(";")
    
    # Answer options (4 per question)
    sql.append("\nINSERT INTO answer_options (id, question_id, text, is_correct, detail, order_num) VALUES")
    option_counter = 0
    option_values = []
    for q_in_all in range(108):
        question_id = f"5000{q_in_all + 1:04d}"
        for opt_in_q in range(4):
            option_counter += 1
            option_id = f"6000{option_counter:04d}"
            is_correct = "true" if opt_in_q == 0 else "false"
            comma = "," if option_counter < 432 else ""
            option_values.append(f"  ('{option_id}', '{question_id}', 'Opción {opt_in_q + 1}', {is_correct}, 'Detalle de la opción', {opt_in_q + 1}){comma}")
    
    sql.extend(option_values)
    sql.append(";")
    
    # Golden level items (3 per golden level)
    sql.append("\nINSERT INTO golden_level_items (id, level_id, title, detail, order_num, is_active) VALUES")
    golden_item_counter = 0
    golden_item_values = []
    for world_idx in range(4):
        golden_level_id = f"2000{world_idx:02d}03"  # Golden level is index 3
        for item_in_golden in range(3):
            golden_item_counter += 1
            golden_item_id = f"9000{golden_item_counter:04d}"
            comma = "," if golden_item_counter < 12 else ""
            golden_item_values.append(f"  ('{golden_item_id}', '{golden_level_id}', 'Item Dorado {item_in_golden + 1}', 'Detalle del item dorado', {item_in_golden + 1}, true){comma}")
    
    sql.extend(golden_item_values)
    sql.append(";")
    
    # Golden level questions (3 per golden level)
    sql.append("\nINSERT INTO golden_level_questions (id, level_id, content, order_num, is_active) VALUES")
    golden_q_counter = 0
    golden_q_values = []
    for world_idx in range(4):
        golden_level_id = f"2000{world_idx:02d}03"  # Golden level is index 3
        for q_in_golden in range(3):
            golden_q_counter += 1
            golden_q_id = f"9500{golden_q_counter:04d}"
            comma = "," if golden_q_counter < 12 else ""
            golden_q_values.append(f"  ('{golden_q_id}', '{golden_level_id}', 'Pregunta Dorada {q_in_golden + 1}?', {q_in_golden + 1}, true){comma}")
    
    sql.extend(golden_q_values)
    sql.append(";")
    
    # Golden level answer options (4 per golden question)
    sql.append("\nINSERT INTO golden_level_answer_options (id, question_id, text, is_correct, order_num) VALUES")
    golden_opt_counter = 0
    golden_opt_values = []
    for gq_in_all in range(12):
        golden_q_id = f"9500{gq_in_all + 1:04d}"
        for opt_in_gq in range(4):
            golden_opt_counter += 1
            golden_opt_id = f"9600{golden_opt_counter:04d}"
            is_correct = "true" if opt_in_gq == 0 else "false"
            comma = "," if golden_opt_counter < 48 else ""
            golden_opt_values.append(f"  ('{golden_opt_id}', '{golden_q_id}', 'Opción Dorada {opt_in_gq + 1}', {is_correct}, {opt_in_gq + 1}){comma}")
    
    sql.extend(golden_opt_values)
    sql.append(";")
    
    # Final level questions (3 per final level)
    sql.append("\nINSERT INTO final_level_questions (id, level_id, content, start_video_url, end_video_url, correct_message, incorrect_message, order_num, is_active) VALUES")
    final_q_counter = 0
    final_q_values = []
    for world_idx in range(4):
        final_level_id = f"2000{world_idx:02d}04"  # Final level is index 4
        for q_in_final in range(3):
            final_q_counter += 1
            final_q_id = f"9800{final_q_counter:04d}"
            comma = "," if final_q_counter < 12 else ""
            final_q_values.append(f"  ('{final_q_id}', '{final_level_id}', 'Pregunta Final {q_in_final + 1}?', '/media/tutorial_video.mp4', '/media/tutorial_video.mp4', 'Correcto!', 'Incorrecto', {q_in_final + 1}, true){comma}")
    
    sql.extend(final_q_values)
    sql.append(";")
    
    # Final level answer options (4 per final question)
    sql.append("\nINSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, order_num) VALUES")
    final_opt_counter = 0
    final_opt_values = []
    for fq_in_all in range(12):
        final_q_id = f"9800{fq_in_all + 1:04d}"
        for opt_in_fq in range(4):
            final_opt_counter += 1
            final_opt_id = f"9900{final_opt_counter:04d}"
            image_id = f"7000{(opt_in_fq % 10) + 1:04d}"
            is_correct = "true" if opt_in_fq == 0 else "false"
            comma = "," if final_opt_counter < 48 else ""
            final_opt_values.append(f"  ('{final_opt_id}', '{final_q_id}', 'Opción Final {opt_in_fq + 1}', '{image_id}', {is_correct}, {opt_in_fq + 1}){comma}")
    
    sql.extend(final_opt_values)
    sql.append(";")
    
    sql.append("\nCOMMIT;")
    sql.append("\n-- ============================================================")
    sql.append("-- FIN DEL SCRIPT")
    sql.append("-- Total de registros: ~700")
    sql.append("-- ============================================================")
    
    return "\n".join(sql)

if __name__ == "__main__":
    script = generate_sql()
    output_file = "/Users/davidmolina/Desktop/Proyectos/cuborojo-farmatour5/database/test_data_complete.sql"
    with open(output_file, 'w') as f:
        f.write(script)
    print(f"SQL script generated: {output_file}")
    print(f"Script length: {len(script)} characters")
