#!/usr/bin/env bash

OUTPUT_FILE="merged.js"

# Очистка старого merged.js
> "$OUTPUT_FILE"

# Собираем все .js файлы, сортируем по глубине (сначала глубокие)
find . -type f -name "*.js" ! -name "merge.sh" ! -name "merged.js" | awk -F'/' '{print NF, $0}' | sort -nr | cut -d ' ' -f2- | while read file; do
    folder=$(dirname "$file")
    echo -e "\n// 🔹 FOLDER: $folder" >> "$OUTPUT_FILE"
    echo -e "// FILE: $file" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo -e "\n" >> "$OUTPUT_FILE"
done

echo "✅ Файл $OUTPUT_FILE успешно создан!"