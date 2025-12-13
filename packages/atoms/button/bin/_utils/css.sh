#!/bin/bash

# CSS compression utility script
# Compresses CSS files instead of using sass

# Function to compress CSS
compress_css() {
    local input_file="$1"
    local output_file="$2"
    
    if [ -z "$input_file" ] || [ -z "$output_file" ]; then
        echo "Usage: compress_css <input_file> <output_file>"
        return 1
    fi
    
    if [ ! -f "$input_file" ]; then
        echo "Error: Input file '$input_file' not found"
        return 1
    fi
    
    # Compress CSS by removing comments, whitespace, and minifying
    cat "$input_file" \
        | sed 's/\/\*[^*]*\*\+\([^/*][^*]*\*\+\)*\///g' \
        | sed 's/[[:space:]]*:[[:space:]]*/:/g' \
        | sed 's/[[:space:]]*{[[:space:]]*/\{/g' \
        | sed 's/[[:space:]]*}[[:space:]]*/\}/g' \
        | sed 's/[[:space:]]*,[[:space:]]*/,/g' \
        | sed 's/[[:space:]]*;[[:space:]]*/;/g' \
        | tr -s ' ' \
        | sed 's/[[:space:]]*$//g' \
        > "$output_file"
    
    echo "CSS compressed: $input_file -> $output_file"
    return 0
}

# Function to process CSS files in a directory
process_css_directory() {
    local input_dir="$1"
    local output_dir="$2"
    
    if [ -z "$input_dir" ] || [ -z "$output_dir" ]; then
        echo "Usage: process_css_directory <input_dir> <output_dir>"
        return 1
    fi
    
    if [ ! -d "$input_dir" ]; then
        echo "Error: Input directory '$input_dir' not found"
        return 1
    fi
    
    mkdir -p "$output_dir"
    
    for css_file in "$input_dir"/*.css; do
        if [ -f "$css_file" ]; then
            filename=$(basename "$css_file")
            compress_css "$css_file" "$output_dir/$filename"
        fi
    done
    
    return 0
}

# Export functions for use in other scripts
export -f compress_css
export -f process_css_directory

# Execute function if called directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    "$@"
fi
