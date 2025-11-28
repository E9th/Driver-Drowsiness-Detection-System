#!/bin/bash
# Driver Fatigue Detector - Environment Setup (Linux Version)
# Author: Mr.Patchara Al-umaree

clear

# --- COLOR STYLES ---
CYAN="\e[96m"
GREEN="\e[92m"
YELLOW="\e[93m"
BLUE="\e[94m"
RED="\e[31m"
RESET="\e[0m"

# --- BANNERS ---
BAR="${BLUE}══════════════════════════════════════════════════════════════════════${RESET}"
GRAD="${CYAN}▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░${RESET}"

STAMP=$(date "+%Y-%m-%d %H:%M:%S")

echo
echo -e "$BAR"
echo -e " ${GREEN}Driver Fatigue Detector — Environment Setup (Linux Version)${RESET}"
echo -e " ${YELLOW}Author:${RESET} Mr. Patchara Al-umaree"
echo -e "$BAR"
echo -e " ${GREEN}MODE:${RESET} ENVIRONMENT SETUP (LINUX)"
echo -e " ${YELLOW}STARTED:${RESET} $STAMP"
echo -e "$GRAD"
echo


# --- FORCE PYTHON 3.10 ---
if command -v python3.10 >/dev/null 2>&1; then
    PY_CMD="python3.10"
else
    echo -e "${RED}[ERROR] Python 3.10 is REQUIRED but not found!${RESET}"
    echo -e "${YELLOW}Please install Python 3.10 manually first.${RESET}"
    exit 1
fi

echo -e " ${GREEN}[OK] Python Interpreter Detected:${RESET} $PY_CMD"
echo -e "$GRAD"
echo


# --- PROGRESS BAR FUNCTION (UNCHANGED) ---
progress() {
    label="$1"
    barlength=48

    for ((i=1; i<=barlength; i++)); do
        pct=$(( i * 100 / barlength ))
        filled=$(printf "%${i}s" | tr ' ' '█')
        empty=$(printf "%$((barlength - i))s" | tr ' ' '.')
        echo -ne " [....] $label |$filled$empty| ${pct}%\r"
        sleep 0.04
    done
    echo
}


# --- UPGRADE PIP ---
echo -e "${CYAN}[SETUP] Upgrading pip (Python 3.10)...${RESET}"
progress "pip bootstrap"
$PY_CMD -m pip install --upgrade pip
echo -e "${GREEN}[OK] Pip upgraded.${RESET}"
echo -e "$GRAD\n"


# --- CHECK REQUIREMENTS.TXT ---
if [[ ! -f "requirements.txt" ]]; then
    echo -e "${RED}[ERROR] requirements.txt not found.${RESET}"
    exit 1
fi

echo -e "${CYAN}[SETUP] Installing dependencies from requirements.txt ...${RESET}"
progress "dependencies"

$PY_CMD -m pip install -r requirements.txt

if [[ $? -ne 0 ]]; then
    echo -e "${RED}[ERROR] Dependency installation failed.${RESET}"
else
    echo -e "${GREEN}[DONE] Dependencies installed successfully.${RESET}"
fi

echo
echo -e "$BAR"
echo -e "        ${GREEN}★ ENVIRONMENT READY — PYTHON 3.10 ★${RESET}"
echo -e "$BAR"
echo -e "$GRAD\n"


# --- MENU LOOP ---
while true; do
    echo -e "${BLUE}────────── MENU ──────────${RESET}"
    echo " [1] Run Program"
    echo " [0] Exit"
    echo -e "${BLUE}──────────────────────────${RESET}"

    read -p "Enter choice (1/0): " choice

    case $choice in
        1)
            if [[ ! -f "main.py" ]]; then
                echo -e "${RED}[ERROR] main.py not found.${RESET}"
            else
                echo -e "${CYAN}[RUN] Launching main.py...${RESET}"
                $PY_CMD main.py
            fi
            ;;
        0)
            echo -e "${GREEN}Goodbye!${RESET}"
            exit 0
            ;;
        *)
            echo -e "${YELLOW}[WARN] Invalid choice. Try again.${RESET}"
            ;;
    esac
    echo
done
